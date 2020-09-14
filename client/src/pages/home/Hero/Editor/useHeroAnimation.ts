import { useState, useRef, useEffect, useCallback } from 'react';
import { random } from 'lodash';

export enum Language {
  HTML = 'html',
  SCSS = 'scss',
  JavaScript = 'js'
}

export default function useHeroAnimation({
  startDelay = 0,
  minTypingDelay = 40,
  maxTypingDelay = 150
}: HeroAnimationConfig = {}) {
  const [hasStarted, setHasStarted] = useState(startDelay === 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [currentView, setCurrentView] = useState(Language.HTML);
  const [html, setHtml] = useState('');
  const [scss, setScss] = useState('');
  const timer = useRef(null);
  const queuedAnimation = useRef(null);

  // Queue the next step in the animation
  const queue = useCallback(
    async (fn: () => void, delay = 200) => {
      return new Promise(resolve => {
        clearTimeout(queuedAnimation.current);

        const callback = async () => {
          queuedAnimation.current = null;
          clearTimeout(timer.current);

          timer.current = setTimeout(() => {
            requestAnimationFrame(() => {
              fn();
              resolve();
            });
          }, delay);
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

  interface TypedLine {
    text: string;
    shouldType: boolean;
    start?: number;
    match?: string;
  }

  const type = useCallback(
    async (text: string, view: Language) => {
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

      return new Promise(resolve => {
        const typeLine = async (line: TypedLine) => {
          return new Promise(resolve => {
            if (!line.shouldType) {
              resolve();
              return;
            }

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
                      resolve(nextText);
                    });
                  });
                },
                Promise.resolve()
              )
              .then(() => resolve());
          });
        };

        return lines
          .reduce(
            (prevPromise: Promise<void>, nextLine: TypedLine) => {
              return prevPromise.then(() => {
                return typeLine(nextLine).then(() =>
                  resolve(nextLine)
                );
              });
            },
            Promise.resolve()
          )
          .then(() => resolve());
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
              await type(step.text, view);
            }

            if (shoudIncrement) {
              setStepIndex(i => i + 1);
            }
          }, step.delay);
        }

        return Promise.resolve();
      }
    },
    [
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
    if (isPlaying && queuedAnimation.current) {
      queuedAnimation.current();
    }
  }, [isPlaying]);

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
  }, [isPlaying, stepIndex, handleStep]);

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

type Step = {
  text?: string;
  view?: Language;
  instant?: boolean;
  delay?: number;
};

/*

Special character keys:

Typewriter text: [-  -]
Caret position: *|*

*/

const steps: Step[] = [
  { text: '<h1>', view: Language.HTML },
  { text: '<h1>*|*</h1>', instant: true },
  {
    instant: true,
    delay: 500,
    text: `
      <h1>
        *|*
      </h1>
    `
  },
  {
    text: `
      <h1>
        [-Good ideas need great developers-]
      </h1>
    `,
    delay: 500
  }
];

type HeroAnimationConfig = {
  startDelay?: number;
  minTypingDelay?: number;
  maxTypingDelay?: number;
};
