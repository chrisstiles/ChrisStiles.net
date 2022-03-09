import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type RefObject
} from 'react';
import useAnimationSteps, { StepType, type Step } from './useAnimationSteps';
import Mouse from './Mouse';
import { sleep } from '@helpers';
import { random } from 'lodash';
import { Language } from '@global';
import type { TabHandle } from './Editor';

export default function useHeroAnimation({
  startDelay = 0,
  minTypingDelay = 40,
  maxTypingDelay = 150,
  htmlTab,
  scssTab,
  mouse: _mouse,
  setState
}: HeroAnimationConfig) {
  // The list of steps that runs one at a time
  // to build the entire hero animation
  const steps = useAnimationSteps(setState);

  // This object manages the simulated mouse element
  const mouse = useMemo(() => {
    return new Mouse(_mouse, htmlTab, scssTab);
  }, [_mouse, htmlTab, scssTab]);

  const [hasStarted, setHasStarted] = useState(startDelay === 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [html, setHtml] = useState('');
  const [scss, setScss] = useState('');
  const timer = useRef<number>();
  const queuedAnimation = useRef<(() => void) | null>(null);
  const isPlayingRef = useRef(isPlaying);

  // The user can change the current editor by clicking
  // one of the tabs, which pauses the animation. We keep
  // track of which editor the current animation step
  // belongs to, and if necessary will switch back to
  // the correct tab when the animation resumes
  const [visibleView, setVisibleView] = useState(Language.HTML);
  const animatingView = useRef(Language.HTML);

  // Queue the next step in the animation
  const queue = useCallback(async (fn: () => void, delay = 200) => {
    return new Promise<void>(resolve => {
      clearTimeout(timer.current);

      const callback = async () => {
        queuedAnimation.current = null;
        clearTimeout(timer.current);

        const run = () => {
          requestAnimationFrame(() => {
            fn();
            resolve();
          });
        };

        if (delay === 0) {
          run();
        } else {
          timer.current = window.setTimeout(run, delay);
        }
      };

      if (!isPlayingRef.current) {
        queuedAnimation.current = callback;
      } else {
        callback();
      }
    });
  }, []);

  const type = useCallback(
    async (step: Step, view: Language) => {
      const { text = '' } = step;
      const fn = view === Language.HTML ? setHtml : setScss;
      const splitLines: string[] = text.split('\n');
      const lines: TypedLine[] = [];
      let hasStarted = false;

      const updateText = async (delay = 0) => {
        return queue(() => {
          if (!hasStarted) {
            hasStarted = true;
            step.onStart?.();
          }

          fn(lines.map(({ text }) => text).join('\n'));
        }, delay);
      };

      if (splitLines.length === 1 && !text.match(/\[-/)) {
        lines.push({ text: '', match: text, shouldType: true });
      } else {
        splitLines.forEach(line => {
          const match = line.match(/\[-(.*)-\]/);

          if (match) {
            lines.push({
              text: line.replace(match[0], '*|*'),
              match: match[1],
              start: match.index,
              shouldType: true
            });
          } else {
            lines.push({
              text: line,
              shouldType: false
            });
          }
        });

        // Set initial content
        await updateText();
      }

      return new Promise<void>(async resolve => {
        const typeLine = async (line: TypedLine) => {
          return new Promise<string>(resolve => {
            const text = line.match ?? line.text;

            text
              .split('')
              .reduce(
                async (
                  prevPromise: Promise<string>,
                  nextText: string,
                  charIndex: number
                ) => {
                  await prevPromise;

                  return await new Promise<string>(async resolve => {
                    const delay =
                      charIndex === 0
                        ? 0
                        : random(minTypingDelay, maxTypingDelay);

                    const start = (line.start ?? 0) + charIndex;

                    line.text =
                      line.text.substring(0, start) +
                      nextText +
                      line.text.substring(start);

                    await updateText(delay);
                    step.onType?.(line.text.replace('*|*', ''));

                    if (isPlayingRef.current) {
                      resolve(nextText);
                    } else {
                      queuedAnimation.current = () => resolve(nextText);
                    }
                  });
                },
                Promise.resolve('')
              )
              .then(resolve);
          });
        };

        await Promise.all(
          lines.filter(({ shouldType }) => shouldType).map(typeLine)
        );

        resolve();
      });
    },
    [minTypingDelay, maxTypingDelay, queue]
  );

  // Handle updating specific step
  const handleStep = useCallback(
    (step?: Step, shoudIncrement = true) => {
      if (!step) {
        setIsPlaying(false);
        return Promise.resolve();
      }

      // Type text into an editor view
      if (step.text?.trim()) {
        // Get the current view and update it if needed
        let view: Language;

        setVisibleView(current => {
          view = step.view ?? current;
          animatingView.current = view;
          return view;
        });

        // Update editor text
        if (step.text) {
          const shouldSelectText =
            step.type === StepType.Select || step.text?.match(/\(-(.*)-\)/);

          return queue(async () => {
            if (step.instant || shouldSelectText) {
              const fn = view === Language.HTML ? setHtml : setScss;
              await queue(() => {
                step.onStart?.();
                fn(step.text ?? '');
              }, 0);
            } else {
              await type(step, view);
            }

            if (shouldSelectText) {
              const el: HTMLElement | null =
                document.querySelector('.token.select');

              if (el) {
                await mouse.selectElement(el, () => {
                  setState({ showSelectHighlight: true });
                  step?.onMouseDown?.();
                });
              } else {
                console.error('Select element not found');
                setState({ showSelectHighlight: false });
              }
            } else {
              setState({ showSelectHighlight: false });
            }

            step.onComplete?.();

            if (shoudIncrement) {
              setStepIndex(i => i + 1);
            }
          }, step.delay);
        }

        return Promise.resolve();
      }

      // Switch to a different tab with mouse animation
      if (step.view && step.view !== visibleView) {
        return queue(async () => {
          if (step.view && step.view !== visibleView) {
            step.onStart?.();
            animatingView.current = step.view;
            await mouse.clickTab(step.view);
            setVisibleView(step.view);
            step.onComplete?.();

            if (shoudIncrement) {
              setStepIndex(i => i + 1);
            }
          }
        }, step.delay);
      }
    },
    [
      mouse,
      visibleView,
      setIsPlaying,
      setVisibleView,
      queue,
      setHtml,
      setScss,
      setStepIndex,
      setState,
      type
    ]
  );

  // Start running animation initially after a delay
  useEffect(() => {
    window.setTimeout(() => {
      setHasStarted(true);
      setIsPlaying(true);
    }, startDelay);
  }, [startDelay]);

  // If the animation pauses and plays again, play a queued animation
  useEffect(() => {
    isPlayingRef.current = isPlaying;

    if (isPlaying) {
      mouse.play();
      queuedAnimation.current?.();
    } else {
      mouse.pause();
    }
  }, [isPlaying, mouse]);

  useEffect(() => {
    if (isPlaying) {
      const step = steps[stepIndex];

      if (step) {
        handleStep(step);
      } else {
        // Animation is complete
        setIsPlaying(false);
        setIsComplete(true);
      }
    }
  }, [steps, isPlaying, stepIndex, handleStep]);

  const play = useCallback(
    async (onResume?: () => void) => {
      if (!hasStarted || isComplete) {
        return;
      }

      if (visibleView !== animatingView.current) {
        await mouse.clickTab(animatingView.current);
        setVisibleView(animatingView.current);
        await sleep(700);
      }

      onResume?.();
      setIsPlaying(true);
    },
    [hasStarted, isComplete, visibleView, mouse]
  );

  const pause = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, []);

  return {
    visibleView,
    html,
    scss,
    isPlaying,
    isComplete,
    play,
    pause,
    setVisibleView
  };
}

type TypedLine = {
  text: string;
  shouldType: boolean;
  start?: number;
  match?: string;
};

type HeroAnimationConfig = {
  startDelay?: number;
  minTypingDelay?: number;
  maxTypingDelay?: number;
  mouse: RefObject<HTMLDivElement>;
  htmlTab: RefObject<TabHandle>;
  scssTab: RefObject<TabHandle>;
  setState(value: any, name?: string): void;
};
