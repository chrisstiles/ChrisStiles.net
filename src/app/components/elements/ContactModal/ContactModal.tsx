import {
  memo,
  useState,
  useEffect,
  useRef,
  useCallback,
  type Dispatch
} from 'react';
import { createPortal } from 'react-dom';
import styles from './ContactModal.module.scss';
import ContactDetails from './ContactDetails';
import { Close } from './icons';
import useClickOutside from '@hooks/useClickOutside';
import useEventListener from '@hooks/useEventListener';
import useVariableRef from '@hooks/useVariableRef';
import useSize from '@hooks/useSize';
import { ContactForm } from '@elements';
import gsap from 'gsap';
import BezierEasing from 'bezier-easing';
import classNames from 'classnames';
import FocusLock from 'react-focus-lock';
import { RemoveScroll } from 'react-remove-scroll';

export default memo(function ContactModal({
  isOpen,
  setIsOpen
}: ContactModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const modal = useRef<HTMLDivElement>(null);
  const isOpenRef = useVariableRef(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useClickOutside(modal, () => setIsOpen(false));
  useEventListener('keydown', e => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      setIsOpen(false);
    }
  });

  const animation = useRef<gsap.core.Timeline | null>(null);
  const bg = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLDivElement>(null);
  const detailsWrapper = useRef<HTMLDivElement>(null);
  const detailsBg = useRef<HTMLDivElement>(null);
  const details = useRef<HTMLDivElement>(null);
  const circle = useRef<HTMLDivElement>(null);
  const leftBar = useRef<HTMLDivElement>(null);
  const rightBar = useRef<HTMLDivElement>(null);

  const getDetailsOffset = useCallback((rect?: Nullable<DOMRect>) => {
    const el = detailsWrapper.current;
    const width = el?.offsetWidth ?? 0;
    const wrapperWidth = rect?.width ?? 0;
    return wrapperWidth ? Math.round(wrapperWidth / 2 - width / 2) : 0;
  }, []);

  const updateDetailsPosition = useCallback(
    ({ contentRect }: ResizeObserverEntry) => {
      if (
        contentRect.width &&
        animation.current &&
        detailsWrapper.current &&
        !animation.current.isActive() &&
        !isOpenRef.current
      ) {
        gsap.set(detailsWrapper.current, { x: getDetailsOffset(contentRect) });
      }
    },
    [getDetailsOffset, isOpenRef]
  );

  const modalRect = useSize(modal, updateDetailsPosition);
  const modalRectRef = useVariableRef(modalRect);

  useEffect(() => {
    const hasRect = !!modalRect?.width;
    const elements = {
      bg: bg.current,
      detailsWrapper: detailsWrapper.current,
      detailsBg: detailsBg.current,
      details: details.current,
      circle: circle.current,
      leftBar: leftBar.current,
      rightBar: rightBar.current,
      form: form.current
    };

    if (
      animation.current ||
      !hasRect ||
      !Object.values(elements).every(el => !!el)
    ) {
      return;
    }

    let startWidth = modalRectRef.current?.width;

    animation.current = gsap.timeline({
      paused: true,
      onStart: () => {
        startWidth = modalRectRef.current?.width;
        setIsAnimating(true);
      },
      onComplete: () => {
        animation.current?.invalidate();
        setIsAnimating(false);
      },
      onReverseComplete: () => {
        animation.current?.invalidate();
        setIsAnimating(false);

        const currentWidth = modalRectRef.current?.width;

        if (currentWidth && startWidth !== currentWidth) {
          startWidth = currentWidth;
          gsap.set(elements.detailsWrapper, {
            x: getDetailsOffset(modalRectRef.current)
          });
        }
      }
    });

    const barHeight = borderRadius + barOffset;
    const barEase = BezierEasing(0.18, 0.72, 0.22, 1);
    const barEaseOut = BezierEasing(0.79, 0.02, 0.11, 1);
    const circleBounce = BezierEasing(0.3, 1.22, 0.31, 1.3);
    const slideXEase = BezierEasing(0.59, 0.59, 0.05, 1);

    animation.current
      .fromTo(
        elements.bg,
        { opacity: 0 },
        {
          opacity: 0.95,
          duration: 0.35
        }
      )
      .fromTo(
        elements.circle,
        { scale: 0 },
        { scale: 1, duration: 0.2, ease: circleBounce },
        '<+=0.08'
      )
      .fromTo(
        [elements.leftBar, elements.rightBar],
        { visibility: 'hidden', x: index => (index === 0 ? '100%' : '-100%') },
        {
          visibility: 'visible',
          x: index => (index === 0 ? barHeight : -barHeight),
          duration: 0.28,
          ease: p => {
            return animation.current?.reversed() ? barEaseOut(p) : barEase(p);
          }
        }
      )
      .fromTo(
        elements.detailsBg,
        { visibility: 'hidden', y: '-100%' },
        {
          y: -barHeight,
          visibility: 'visible',
          duration: 0.23,
          ease: BezierEasing(0.68, 0.15, 0.13, 0.98)
        },
        '>-0.1'
      )
      .addLabel('slideX', '>+0.02')
      .fromTo(
        elements.details,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.35
        },
        '<+0.3'
      )
      .fromTo(
        elements.detailsWrapper,
        { x: () => getDetailsOffset(modalRectRef.current) },
        {
          x: 0,
          duration: 0.3,
          ease: slideXEase
        },
        'slideX'
      )
      .fromTo(
        elements.form,
        { x: '-100%' },
        { x: 0, ease: slideXEase, duration: 0.28 },
        'slideX'
      );
  }, [modalRect, modalRectRef, getDetailsOffset]);

  useEffect(() => {
    if (!animation.current) {
      setIsVisible(isOpen);
      return;
    }

    setIsAnimating(true);
    setIsVisible(isOpen);

    if (isOpen) {
      animation.current.play(undefined, false);
    } else {
      animation.current.reverse(undefined, false);
    }
  }, [isOpen]);

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
            className={classNames(styles.wrapper, {
              [styles.open]: isVisible,
              [styles.animating]: isAnimating || animation.current?.isActive()
            })}
          >
            <div
              ref={modal}
              className={styles.modal}
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

const borderRadius = parseInt(styles.borderRadius);
const barOffset = parseInt(styles.barOffset);

type ContactModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<boolean>;
};
