import {
  memo,
  useState,
  useEffect,
  useRef,
  useCallback,
  type Dispatch,
  type RefObject
} from 'react';
import { createPortal } from 'react-dom';
import styles from './ContactModal.module.scss';
import ContactDetails from './ContactDetails';
import { Close } from './icons';
import useClickOutside from '@hooks/useClickOutside';
import useEventListener from '@hooks/useEventListener';
import useVariableRef from '@hooks/useVariableRef';
import useSize from '@hooks/useSize';
import { toggleGlobalAnimations, isSafari } from '@helpers';
import { ContactForm } from '@elements';
import classNames from 'classnames';
import FocusLock from 'react-focus-lock';
import { RemoveScroll } from 'react-remove-scroll';
import { round } from 'lodash';
import {
  timeline,
  type AnimationControls,
  type TimelineDefinition,
  type TimelineOptions,
  type BezierDefinition,
  type ElementOrSelector,
  type TimelineSegment
} from 'motion';

// TODO Fix shifting content on Windows when scrollbar hides

export default memo(function ContactModal({
  isOpen,
  openButton,
  setIsOpen
}: ContactModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const isOpenRef = useVariableRef(isOpen);
  const prevIsOpen = useRef(false);
  const isAnimating = useRef(false);
  const currentAnimation = useRef<AnimationControls>();
  const animationDuration = useRef<number>();
  const modal = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLDivElement>(null);
  const detailsWrapper = useRef<HTMLDivElement>(null);
  const detailsBg = useRef<HTMLDivElement>(null);
  const details = useRef<HTMLDivElement>(null);
  const circle = useRef<HTMLDivElement>(null);
  const leftBar = useRef<HTMLDivElement>(null);
  const rightBar = useRef<HTMLDivElement>(null);

  const layout = useRef({
    width: 0,
    height: 0,
    detailsOffset: 0,
    borderRadius: 0,
    barOffset: 0,
    barWidth: 0,
    barHeight: 0
  });

  useSize(modal, entry => {
    if (!modal.current) return;

    const { width, height } = entry.contentRect;
    const detailsWidth = detailsWrapper.current?.offsetWidth ?? 0;
    const detailsOffset = Math.round(width / 2 - detailsWidth / 2);
    const style = getComputedStyle(modal.current);
    const borderRadius =
      parseInt(style.getPropertyValue('--border-radius')) || 0;
    const barOffset = parseInt(style.getPropertyValue('--bar-offset')) || 0;
    const barWidth = leftBar.current?.offsetWidth ?? 0;
    const barHeight = borderRadius + barOffset;

    layout.current = {
      width,
      height,
      detailsOffset,
      borderRadius,
      barOffset,
      barWidth,
      barHeight
    };

    layout.current.detailsOffset = Math.round(width / 2 - detailsWidth / 2);
  });

  useEffect(() => setIsMounted(true), []);

  useClickOutside(modal, () => setIsOpen(false));
  useEventListener('keydown', e => {
    if (!isOpenRef.current) return;
    if (e.key === 'Escape' || e.key === 'Esc') {
      setIsOpen(false);
    }
  });

  const animate = useCallback(
    async (isOpen: boolean) => {
      if (
        !layout.current.width ||
        !modal.current ||
        !bg.current ||
        !detailsWrapper.current ||
        !detailsBg.current ||
        !details.current ||
        !circle.current ||
        !leftBar.current ||
        !rightBar.current ||
        !form.current
      ) {
        return;
      }

      toggleGlobalAnimations(!isOpen);
      wrapper.current?.classList.add(styles.animating);
      modal.current?.focus();
      isAnimating.current = true;

      const prev = currentAnimation.current;
      const isPrevRunning = prev?.playState === 'running';
      const startTime = isPrevRunning ? 1 - (prev?.currentTime ?? 1) : 0;

      const options: TimelineOptions = {
        defaultOptions: {
          allowWebkitAcceleration: true
        }
      };

      if (isPrevRunning) {
        if (animationDuration.current) {
          options.duration = animationDuration.current;
        }

        prev.stop();
      }

      const { height, barWidth, barHeight, detailsOffset } = layout.current;

      // We have to define separate timelines for opening and closing
      // because reversing a timeline disables hardware acceleration
      const sequence: TimelineDefinition = isOpen
        ? // Opening animation timeline
          [
            [bg.current, { opacity: 1 }, { duration: 0.35 }],
            show(circle.current, true, 0.08),
            [
              circle.current,

              { transform: 'scale(1)' },
              { duration: 0.2, easing: circleEase, at: '<' }
            ],
            show([leftBar.current, rightBar.current], true),
            [
              leftBar.current,
              {
                transform: `translateX(${barHeight}px)`
              },
              { duration: 0.28, easing: barEase }
            ],
            [
              rightBar.current,
              { transform: `translateX(-${barHeight}px)` },
              { duration: 0.28, easing: barEase, at: '<' }
            ],
            show(detailsBg.current, true, '-0.1'),
            [
              detailsBg.current,
              { transform: `translateY(-${barHeight}px)` },
              {
                duration: 0.26,
                easing: bgEase,
                at: '<'
              }
            ],
            { name: 'slideX', at: '+0.02' },
            [details.current, { opacity: 1 }, { duration: 0.3, at: '+0.1' }],
            [
              detailsWrapper.current,
              {
                transform: isPrevRunning
                  ? 'translateX(0)'
                  : [`translateX(${detailsOffset}px)`, 'translateX(0)']
              },
              {
                duration: 0.3,
                easing: slideXEase,
                at: 'slideX'
              }
            ],
            [
              form.current,
              { transform: 'translateX(0)' },
              {
                duration: 0.28,
                easing: slideXEase,
                at: 'slideX'
              }
            ]
          ]
        : // Closing animation timeline
          [
            [
              form.current,
              { transform: 'translateX(-100%)' },
              {
                duration: 0.28,
                easing: reverseEase(slideXEase)
              }
            ],
            [
              detailsWrapper.current,
              {
                transform: `translateX(${detailsOffset}px)`
              },
              {
                duration: 0.3,
                easing: reverseEase(slideXEase),
                at: '<'
              }
            ],
            { name: 'slideXDone', at: '+0.02' },
            [details.current, { opacity: 0 }, { duration: 0.3, at: '-0.1' }],
            [
              detailsBg.current,
              { transform: `translateY(-${height}px)` },
              {
                duration: 0.26,
                easing: reverseEase(bgEase),
                at: 'slideXDone'
              }
            ],
            show(detailsBg.current, false),
            [
              rightBar.current,
              { transform: `translateX(-${barWidth}px)` },
              {
                duration: 0.28,
                easing: barEaseOut,
                at: '<'
              }
            ],
            [
              leftBar.current,
              {
                transform: `translateX(${barWidth}px)`
              },
              { duration: 0.28, easing: barEaseOut, at: '<' }
            ],
            show([leftBar.current, rightBar.current], false),
            [
              circle.current,

              { transform: 'scale(0.0001)' },
              {
                duration: 0.2,
                easing: reverseEase(circleEase)
              }
            ],
            show(circle.current, false),
            [bg.current, { opacity: 0 }, { duration: 0.35, at: '-0.08' }]
          ];

      const animation = timeline(sequence, options);

      if (startTime) animation.currentTime = startTime;

      currentAnimation.current = animation;
      animationDuration.current = animation.duration;

      await animation.finished;

      if (currentAnimation.current === animation) {
        isAnimating.current = false;
        currentAnimation.current = undefined;
        animationDuration.current = undefined;
        wrapper.current?.classList.remove(styles.animating);

        if (!isOpen) {
          openButton.current?.classList.add('no-outline');
          openButton.current?.focus({ preventScroll: true });

          setTimeout(() => {
            // Safari handles blur/focus different than other browsers
            if (!isSafari()) {
              openButton.current?.blur();
              openButton.current?.classList.remove('no-outline');
            }
          }, 100);
        }
      }
    },
    [openButton]
  );

  if (isOpen !== prevIsOpen.current) {
    prevIsOpen.current = isOpen;
    animate(isOpen);
  }

  return !isMounted
    ? null
    : createPortal(
        <FocusLock
          autoFocus={false}
          disabled={!isOpen}
        >
          <RemoveScroll
            allowPinchZoom
            enabled={isOpen}
            ref={wrapper}
            className={classNames(styles.wrapper, {
              [styles.open]: isOpen,
              [styles.animating]: isAnimating.current
            })}
          >
            <div
              ref={modal}
              className={styles.modal}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-modal-title"
              aria-describedby="contact-modal-description"
            >
              <ContactDetails
                headlineId="contact-modal-title"
                descriptionId="contact-modal-description"
                wrapperRef={detailsWrapper}
                contentRef={details}
                bgRef={detailsBg}
                circleRef={circle}
                leftBarRef={leftBar}
                rightBarRef={rightBar}
              />
              <div className={styles.formWrapper}>
                <div
                  ref={form}
                  className={styles.form}
                >
                  <button
                    className={styles.close}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="sr">Close modal</div>
                    <Close aria-hidden="true" />
                  </button>
                  <ContactForm />
                </div>
              </div>
            </div>
            <div
              ref={bg}
              className={styles.bg}
            />
          </RemoveScroll>
        </FocusLock>,
        document.body
      );
});

const circleEase: BezierDefinition = [0.3, 1.22, 0.31, 1.3];
const bgEase: BezierDefinition = [0.46, 0.07, 0.18, 1];
const barEase: BezierDefinition = [0.18, 0.72, 0.22, 1];
const barEaseOut: BezierDefinition = [0.79, 0.02, 0.11, 1];
const slideXEase: BezierDefinition = [0.59, 0.59, 0.05, 1];

function show(
  el: ElementOrSelector,
  isVisible: boolean,
  at?: string | number
): TimelineSegment {
  return [el, { opacity: isVisible ? 1 : 0 }, { duration: 0.0001, at }];
}

function reverseEase([x1, y1, x2, y2]: BezierDefinition): BezierDefinition {
  const ease = [1 - x2, 1 - y2, 1 - x1, 1 - y1].map(v => round(v, 3));
  return ease as [number, number, number, number];
}

type ContactModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<boolean>;
  openButton: RefObject<HTMLButtonElement>;
};
