import { useState, useRef, useEffect, useCallback } from 'react';
import { random } from 'lodash';

export enum Language {
  HTML = 'html',
  SCSS = 'scss',
  JavaScript = 'js'
}

export default function useHeroAnimation({
  startDelay = 0,
  minTypingDelay = 70,
  maxTypingDelay = 200
}: HeroAnimationConfig = {}) {
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

  const type = useCallback(
    (text, view) => {
      return new Promise(resolve => {
        const fn = view === Language.HTML ? setHtml : setScss;

        text
          .split('')
          .reduce((prevPromise: Promise<void>, nextText: string) => {
            return prevPromise.then(() => {
              return new Promise(resolve => {
                setTimeout(() => {
                  requestAnimationFrame(() => {
                    fn(text => text + nextText);
                    resolve(nextText);
                  });
                }, random(minTypingDelay, maxTypingDelay));
              });
            });
          }, Promise.resolve())
          .then(() => resolve());
      });
    },
    [minTypingDelay, maxTypingDelay]
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
              fn(step.text);
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
    setTimeout(() => setIsPlaying(true), startDelay);
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
      if (!isComplete) {
        setIsPlaying(shouldPlay);
      }
    },
    [isComplete]
  );

  return {
    currentView,
    html,
    scss,
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

const steps: Step[] = [
  { text: '<h1>', view: Language.HTML },
  { text: '<h1></h1>', instant: true, delay: 3000 },
  {
    instant: true,
    text: `
      <h1>

      </h1>
    `
  }
];

type HeroAnimationConfig = {
  startDelay?: number;
  minTypingDelay?: number;
  maxTypingDelay?: number;
};
