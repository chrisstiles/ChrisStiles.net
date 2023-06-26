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
import useAnimationSteps, {
  initialView,
  StepType,
  type Step
} from './useAnimationSteps';
import Mouse from './Mouse';
import useEffectAfterMount from '@hooks/useEffectAfterMount';
import useVariableRef from '@hooks/useVariableRef';
import { useGlobalState } from '@templates/Home';
import { sleep, stripHtml } from '@helpers';
import { random, isFunction, isNumber } from 'lodash';
import gsap from 'gsap';
import { Language } from '@global';
import type { SetHeroStateFunction } from '../Hero';
import type { TabHandle } from './Editor';
import type { AutocompleteHandle } from './Autocomplete';

export default function useHeroAnimation({
  startDelay = 1000,
  minTypingDelay = 40,
  maxTypingDelay = 90,
  typescriptTab,
  htmlTab,
  scssTab,
  autocomplete,
  mouse: _mouse,
  setState,
  setHeaderBoundsVisible,
  setHeaderBullets,
  setAccentsVisible
}: HeroAnimationConfig) {
  // Animation state
  const [hasStarted, setHasStarted] = useState(startDelay === 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const delayedCall = useRef<gsap.core.Tween>();
  const queuedAnimation = useRef<AnimationCallback>(null);
  const hasStartedRef = useRef(hasStarted);
  const isPlayingRef = useRef(isPlaying);
  const isPausedRef = useRef(false);

  // The user can change the current editor by clicking
  // one of the tabs, which pauses the animation. We keep
  // track of which editor the current animation step
  // belongs to, and if necessary will switch back to
  // the correct tab when the animation resumes
  const [visibleView, setVisibleView] = useState(initialView);
  const visibleViewRef = useVariableRef(visibleView);
  const animatingView = useRef(initialView);

  // Simulated mouse
  const mouse = useMemo(() => {
    return new Mouse(_mouse, typescriptTab, htmlTab, scssTab);
  }, [_mouse, typescriptTab, htmlTab, scssTab]);

  // Autocomplete
  const [autocompleteVisible, setAutocompleteVisible] = useState(false);
  const [autocompleteItems, setAutocompleteItems] = useState<string[]>([]);
  const [autocompleteText, setAutocompleteText] = useState('');
  const autocompleteVisibleRef = useVariableRef(autocompleteVisible);

  const ensureAnimatingViewIsVisible = useCallback(
    async (
      view = animatingView.current,
      hideOnComplete = true,
      startDelay = 300,
      endDelay = 700
    ) => {
      if (
        view !== Language.Console &&
        ((isPlayingRef.current && visibleViewRef.current !== view) ||
          animatingView.current !== view)
      ) {
        await mouse.clickTab(view, {
          hideOnComplete,
          delay: startDelay / 1000
        });

        visibleViewRef.current = animatingView.current;
        animatingView.current = view;
        setVisibleView(view);
        await sleep(endDelay);
      }
    },
    [mouse, visibleViewRef]
  );

  const pause = useCallback(() => {
    isPlayingRef.current = false;
    isPausedRef.current = true;
    setIsPlaying(false);
    mouse.pause();
  }, [mouse]);

  const { modalIsOpen } = useGlobalState();
  const modalIsOpenRef = useVariableRef(modalIsOpen);
  const onPlayCallbacks = useRef<AnimationCallback[]>([]);

  const play = useCallback(
    async (
      handlerOrDelay?: AnimationCallback | number,
      delay?: Nullable<number>
    ) => {
      if (isComplete) return;

      const callback = isFunction(handlerOrDelay) ? handlerOrDelay : null;

      delay ??= isNumber(handlerOrDelay) ? handlerOrDelay : 0;
      if (delay) await sleep(delay);

      hasStartedRef.current = true;
      isPlayingRef.current = true;
      isPausedRef.current = false;

      await ensureAnimatingViewIsVisible();

      if (modalIsOpenRef.current) {
        pause();
        if (callback) onPlayCallbacks.current.push(callback);
        return;
      }

      mouse.play();

      if (onPlayCallbacks.current.length) {
        onPlayCallbacks.current.forEach(fn => fn?.());
        onPlayCallbacks.current = [];
      }

      callback?.();
      setHasStarted(true);
      setIsPlaying(true);
    },
    [isComplete, modalIsOpenRef, mouse, pause, ensureAnimatingViewIsVisible]
  );

  useEffectAfterMount(() => {
    if (hasStartedRef.current) {
      modalIsOpen ? pause() : play(1200);
    }
  }, [modalIsOpen, play, pause]);

  // The list of steps that runs one at a time
  // to build the entire hero animation
  const { steps, baseText } = useAnimationSteps({
    setState,
    setHeaderBoundsVisible,
    setHeaderBullets,
    setAccentsVisible,
    setAutocompleteVisible,
    pause
  });

  // Current code
  const [typescript, setTypescript] = useState(baseText.typescript);
  const [html, setHtml] = useState(baseText.html);
  const [scss, setScss] = useState(baseText.scss);

  // Queue the next step in the animation
  const queue = useCallback(
    async (fn: () => void, delay = 200) => {
      return new Promise<void>(resolve => {
        delayedCall.current?.kill();

        const callback = () => {
          queuedAnimation.current = null;

          delayedCall.current?.kill();

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
            delayedCall.current = gsap.delayedCall(delay / 1000, run);
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

  const updateViewContent = useCallback((view: Language, text: string) => {
    const handlers: { [key in Language]?: any } = {
      [Language.TypeScript]: setTypescript,
      [Language.HTML]: setHtml,
      [Language.SCSS]: setScss
    };

    handlers[view]?.(text);
  }, []);

  const type = useCallback(
    async (step: Step, view: Language) => {
      const { text = '' } = step;
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

          updateViewContent(view, lines.map(({ text }) => text).join('\n'));
        }, delay);
      };

      if (splitLines.length === 1 && !text.includes('[-')) {
        lines.push({ text: '#|#', match: text, shouldType: true });
      } else {
        splitLines.forEach(line => {
          const match = line.match(/\[!?-(.*)-\]/);

          if (match) {
            const shouldReverse = line.includes('[!-');
            const text = shouldReverse
              ? line.replace(match[0], `${match[1]}#|#`)
              : line.replace(match[0], '#|#');

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
          return new Promise<string>(async resolve => {
            let hasStarted = false;

            const text = line.match ?? line.text;
            const fn = line.shouldReverse ? 'reduceRight' : 'reduce';
            const endText = line.text.substring(
              (line.start ?? 0) + text.length
            );

            const minDelay = step.minTypingDelay ?? minTypingDelay;
            const maxDelay = step.maxTypingDelay ?? maxTypingDelay;

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
                    const delay = !hasStarted ? 0 : random(minDelay, maxDelay);

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

                    if (step.autocomplete && !autocompleteVisibleRef.current) {
                      autocompleteVisibleRef.current = true;
                      setAutocompleteVisible(true);
                    }

                    if (step.onType || autocompleteVisibleRef.current) {
                      const typedText = stripHtml(
                        line.text.replace('#|#', '').trim()
                      );

                      step.onType?.(typedText);
                      setAutocompleteText(typedText);
                    }

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
    [
      queue,
      updateViewContent,
      setState,
      minTypingDelay,
      maxTypingDelay,
      autocompleteVisibleRef
    ]
  );

  // Handle updating specific step
  const handleStep = useCallback(
    async (step?: Step, shoudIncrement = true) => {
      if (!step) {
        setIsPlaying(false);
        return Promise.resolve();
      }

      if (step.autocomplete?.items) {
        setAutocompleteItems(step.autocomplete.items);
      }

      // Type text into an editor view
      if (step.text?.trim()) {
        // Get the current view and update it if needed
        const view = step.view ?? animatingView.current;
        await ensureAnimatingViewIsVisible(view, !step.forceMouseVisible);

        // Update editor text
        const shouldSelectText =
          step.type === StepType.Select || step.text?.match(/\(-(.*)-\)/);

        return queue(async () => {
          if (step.instant || shouldSelectText) {
            await queue(async () => {
              step.onStart?.();
              setState(step.startState);

              if (shouldSelectText) {
                flushSync(() => updateViewContent(view, step.text ?? ''));
              } else {
                updateViewContent(view, step.text ?? '');
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

          if (step.autocomplete) {
            await autocomplete.current?.selectItem(
              step.autocomplete.selectedItem
            );
          }

          setState(step.completeState);
          step.onComplete?.();

          if (shoudIncrement) {
            setStepIndex(i => i + 1);
          }
        }, step.delay);
      } else {
        return queue(() => {
          step.onStart?.();
          setState(step.startState);
          step.onComplete?.();
          setState(step.completeState);

          if (shoudIncrement) {
            setStepIndex(i => i + 1);
          }
        }, step.delay);
      }
    },
    [
      ensureAnimatingViewIsVisible,
      autocomplete,
      queue,
      setState,
      updateViewContent,
      type,
      mouse
    ]
  );

  // Start running animation initially after a delay
  useEffect(() => {
    gsap.delayedCall(startDelay / 1000, () => {
      if (
        !isPausedRef.current &&
        visibleViewRef.current === animatingView.current
      ) {
        play();
      }
    });
  }, [visibleViewRef, startDelay, setState, play]);

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

  return {
    visibleView,
    setVisibleView,
    typescript,
    html,
    scss,
    autocompleteVisible,
    autocompleteItems,
    autocompleteText,
    setAutocompleteVisible,
    hasStarted,
    isPlaying,
    isComplete,
    play,
    pause
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
  typescriptTab: RefObject<TabHandle>;
  htmlTab: RefObject<TabHandle>;
  scssTab: RefObject<TabHandle>;
  autocomplete: RefObject<AutocompleteHandle>;
  setState: SetHeroStateFunction;
  setHeaderBoundsVisible: Dispatch<boolean>;
  setHeaderBullets: Dispatch<SetStateAction<string[]>>;
  setAccentsVisible: Dispatch<boolean>;
};

type AnimationCallback = Nullable<() => void>;
