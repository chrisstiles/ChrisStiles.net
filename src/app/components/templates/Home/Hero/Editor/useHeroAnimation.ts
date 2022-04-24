import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type RefObject,
  type Dispatch,
  type SetStateAction
} from 'react';
import { flushSync } from 'react-dom';
import useAnimationSteps, { StepType, type Step } from './useAnimationSteps';
import Mouse from './Mouse';
import { sleep } from '@helpers';
import { random } from 'lodash';
import { Language } from '@global';
import type { SetHeroStateFunction } from '../Hero';
import type { TabHandle } from './Editor';

export default function useHeroAnimation({
  startDelay = 1000,
  minTypingDelay = 40,
  maxTypingDelay = 90,
  htmlTab,
  scssTab,
  mouse: _mouse,
  setState,
  setHeaderBullets
}: HeroAnimationConfig) {
  // The list of steps that runs one at a time
  // to build the entire hero animation
  const steps = useAnimationSteps(setState, setHeaderBullets);

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
  const isPausedRef = useRef(false);

  // The user can change the current editor by clicking
  // one of the tabs, which pauses the animation. We keep
  // track of which editor the current animation step
  // belongs to, and if necessary will switch back to
  // the correct tab when the animation resumes
  const [visibleView, setVisibleView] = useState(Language.HTML);
  const visibleViewRef = useRef(Language.HTML);
  const animatingView = useRef(Language.HTML);

  useEffect(() => {
    visibleViewRef.current = visibleView;
  }, [visibleView]);

  const ensureAnimatingViewIsVisible = useCallback(
    async (
      view = animatingView.current,
      hideOnComplete = true,
      delay = 700
    ) => {
      if (
        (isPlayingRef.current && visibleViewRef.current !== view) ||
        animatingView.current !== view
      ) {
        await mouse.clickTab(view, hideOnComplete);
        visibleViewRef.current = animatingView.current;
        animatingView.current = view;
        setVisibleView(view);
        await sleep(delay);
      }
    },
    [mouse]
  );

  // Queue the next step in the animation
  const queue = useCallback(
    async (fn: () => void, delay = 200) => {
      return new Promise<void>(resolve => {
        clearTimeout(timer.current);

        const callback = () => {
          queuedAnimation.current = null;
          clearTimeout(timer.current);

          const run = async () => {
            await ensureAnimatingViewIsVisible();

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
    },
    [ensureAnimatingViewIsVisible]
  );

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
            setState(step.startState);
          }

          fn(lines.map(({ text }) => text).join('\n'));
        }, delay);
      };

      if (splitLines.length === 1 && !text.includes('[-')) {
        lines.push({ text: '*|*', match: text, shouldType: true });
      } else {
        splitLines.forEach(line => {
          const match = line.match(/\[!?-(.*)-\]/);

          if (match) {
            const shouldReverse = line.includes('[!-');
            const text = shouldReverse
              ? line.replace(match[0], `${match[1]}*|*`)
              : line.replace(match[0], '*|*');

            lines.push({
              shouldReverse,
              text,
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
            let hasStarted = false;

            const text = line.match ?? line.text;
            const fn = line.shouldReverse ? 'reduceRight' : 'reduce';
            const endText = line.text.substring(
              (line.start ?? 0) + text.length
            );

            text
              .split('')
              [fn](
                async (
                  prevPromise: Promise<string>,
                  nextText: string,
                  charIndex: number
                ) => {
                  await prevPromise;

                  return await new Promise<string>(async resolve => {
                    const start = (line.start ?? 0) + charIndex;
                    const delay = !hasStarted
                      ? 0
                      : random(minTypingDelay, maxTypingDelay);

                    hasStarted = true;

                    if (line.shouldReverse) {
                      line.text = line.text.substring(0, start) + endText;
                    } else {
                      line.text =
                        line.text.substring(0, start) +
                        nextText +
                        line.text.substring(start);
                    }

                    await updateText(delay);
                    step.onType?.(line.text.replace('*|*', '').trim());

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
    [queue, setState, minTypingDelay, maxTypingDelay]
  );

  // Handle updating specific step
  const handleStep = useCallback(
    async (step?: Step, shoudIncrement = true) => {
      if (!step) {
        setIsPlaying(false);
        return Promise.resolve();
      }

      // Type text into an editor view
      if (step.text?.trim()) {
        // Get the current view and update it if needed
        const view = step.view ?? animatingView.current;
        await ensureAnimatingViewIsVisible(view, !step.forceMouseVisible);

        // Update editor text
        if (step.text) {
          const shouldSelectText =
            step.type === StepType.Select || step.text?.match(/\(-(.*)-\)/);

          return queue(async () => {
            if (step.instant || shouldSelectText) {
              const fn = view === Language.HTML ? setHtml : setScss;
              await queue(async () => {
                step.onStart?.();
                setState(step.startState);

                if (shouldSelectText) {
                  flushSync(() => fn(step.text ?? ''));
                } else {
                  fn(step.text ?? '');
                }
              }, 0);
            } else {
              await type(step, view);
            }

            if (shouldSelectText) {
              const el: HTMLElement | null =
                document.querySelector('.token.select');

              if (el) {
                await mouse.selectElement(el, async () => {
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

            setState(step.completeState);
            step.onComplete?.();

            if (shoudIncrement) {
              setStepIndex(i => i + 1);
            }
          }, step.delay);
        }

        return Promise.resolve();
      }
    },
    [ensureAnimatingViewIsVisible, queue, setState, type, mouse]
  );

  // Start running animation initially after a delay
  useEffect(() => {
    window.setTimeout(() => {
      if (
        !isPausedRef.current &&
        visibleViewRef.current === animatingView.current
      ) {
        setHasStarted(true);
        setIsPlaying(true);
      }
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
      if (isComplete) {
        return;
      }

      isPlayingRef.current = true;
      isPausedRef.current = false;

      await ensureAnimatingViewIsVisible();
      onResume?.();
      setHasStarted(true);
      setIsPlaying(true);
    },
    [ensureAnimatingViewIsVisible, isComplete]
  );

  const pause = useCallback(() => {
    isPlayingRef.current = false;
    isPausedRef.current = true;
    setIsPlaying(false);
  }, []);

  return {
    visibleView,
    html,
    scss,
    hasStarted,
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
  shouldReverse?: boolean;
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
  setState: SetHeroStateFunction;
  setHeaderBullets: Dispatch<SetStateAction<string[]>>;
};
