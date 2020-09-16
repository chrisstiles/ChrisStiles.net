import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  RefObject
} from 'react';
import useAnimationSteps, { Step } from './useAnimationSteps';
import Mouse from './Mouse';
import { random } from 'lodash';
import { TabHandle } from './Editor';

export enum Language {
  HTML = 'html',
  SCSS = 'scss',
  JavaScript = 'js'
}

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
  const [currentView, setCurrentView] = useState(Language.HTML);
  const [html, setHtml] = useState('');
  const [scss, setScss] = useState('');
  const timer = useRef(null);
  const queuedAnimation = useRef(null);
  const isPlayingRef = useRef(isPlaying);

  // Queue the next step in the animation
  const queue = useCallback(
    async (fn: () => void, delay = 200) => {
      return new Promise(resolve => {
        clearTimeout(queuedAnimation.current);

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
            timer.current = setTimeout(run, delay);
          }
        };

        if (!isPlaying) {
          queuedAnimation.current = callback;
        } else {
          callback();
        }
      });
    },
    [isPlaying]
  );

  const type = useCallback(
    async (step: Step, view: Language) => {
      const { text } = step;
      const fn = view === Language.HTML ? setHtml : setScss;
      const splitLines: string[] = text.split('\n');
      const lines: TypedLine[] = [];

      const updateText = async (delay = 0) => {
        return queue(() => {
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
              text: line.replace(match[0], ''),
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

      return new Promise(async resolve => {
        const typeLine = async (line: TypedLine) => {
          return new Promise(resolve => {
            line.text += '*|*';
            const text = line.match ?? line.text;

            text
              .split('')
              .reduce(
                (
                  prevPromise: Promise<void>,
                  nextText: string,
                  charIndex: number
                ) => {
                  return prevPromise.then(() => {
                    return new Promise(async resolve => {
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

                      if (step.onType) {
                        step.onType(line.text.replace('*|*', ''));
                      }

                      if (isPlayingRef.current) {
                        resolve(nextText);
                      } else {
                        queuedAnimation.current = () =>
                          resolve(nextText);
                      }
                    });
                  });
                },
                Promise.resolve()
              )
              .then(resolve);
          });
        };

        Promise.all(
          lines.filter(({ shouldType }) => shouldType).map(typeLine)
        ).then(resolve);
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
      if (step.text) {
        // Get the current view and update it if needed
        let view: Language;

        setCurrentView(currentView => {
          view = step.view ?? currentView;
          return view;
        });

        // Update editor text
        if (step.text) {
          return queue(async () => {
            if (step.instant) {
              const fn = view === Language.HTML ? setHtml : setScss;
              await queue(() => fn(step.text), 0);
            } else {
              await type(step, view);
            }

            if (shoudIncrement) {
              setStepIndex(i => i + 1);
            }
          }, step.delay);
        }

        return Promise.resolve();
      }

      // Switch to a different tab with mouse animation
      if (step.view && step.view !== currentView) {
        // await mouse.clickTab(step.view);
        return queue(async () => {
          await mouse.clickTab(step.view);
          setCurrentView(step.view);

          if (shoudIncrement) {
            setStepIndex(i => i + 1);
          }
        }, step.delay);
      }
    },
    [
      mouse,
      currentView,
      setIsPlaying,
      setCurrentView,
      queue,
      setHtml,
      setScss,
      setStepIndex,
      type
    ]
  );

  // Start running animation initially after a delay
  useEffect(() => {
    setTimeout(() => {
      setHasStarted(true);
      setIsPlaying(true);
    }, startDelay);
  }, [startDelay]);

  // If the animation pauses and plays again, play a queued animation
  useEffect(() => {
    isPlayingRef.current = isPlaying;

    if (isPlaying) {
      mouse.play();

      if (queuedAnimation.current) {
        queuedAnimation.current();
      }
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

  const _setIsPlaying = useCallback(
    (shouldPlay: boolean) => {
      if (hasStarted && !isComplete) {
        setIsPlaying(shouldPlay);
      }
    },
    [hasStarted, isComplete]
  );

  return {
    currentView,
    html,
    scss,
    isPlaying,
    isComplete,
    setCurrentView,
    setIsPlaying: _setIsPlaying
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
