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
import Close from './close.svg';
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

// TODO Add sidebar contact details

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
        !animation.current?.isActive() &&
        !isOpenRef.current &&
        detailsWrapper.current &&
        contentRect?.width
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
      bgEl: bg.current,
      detailsWrapperEl: detailsWrapper.current,
      detailsBgEl: detailsBg.current,
      detailsEl: details.current,
      circleEl: circle.current,
      leftBarEl: leftBar.current,
      rightBarEl: rightBar.current,
      formEl: form.current
    };

    if (animation.current || !Object.values(elements).every(el => !!el)) {
      return () => {
        if (hasRect) {
          animation.current?.invalidate();
        }
      };
    }

    animation.current = gsap.timeline({
      paused: true,
      onStart: () => setIsAnimating(true),
      onComplete: () => setIsAnimating(false),
      onReverseComplete: () => setIsAnimating(false)
    });

    const barHeight = borderRadius + barOffset;
    const barEase = BezierEasing(0.18, 0.72, 0.22, 1);
    const barEaseOut = BezierEasing(0.79, 0.02, 0.11, 1);
    const barBounce = BezierEasing(0.3, 1.22, 0.31, 1.3);

    animation.current
      .fromTo(
        elements.bgEl,
        { opacity: 0 },
        {
          opacity: 0.95,
          duration: 0.35
        }
      )
      .fromTo(
        elements.circleEl,
        { scale: 0 },
        { scale: 1, duration: 0.2, ease: barBounce },
        '<+=0.08'
      )
      .fromTo(
        [elements.leftBarEl, elements.rightBarEl],
        {
          x: index => (index === 0 ? -barHeight : barHeight)
        },
        {
          x: index => (index === 0 ? '-100%' : '100%'),
          visibility: 'visible',
          immediateRender: false,
          ease: p => {
            return animation.current?.reversed() ? barEaseOut(p) : barEase(p);
          },
          duration: 0.28
        }
      )
      .fromTo(
        elements.detailsBgEl,
        { y: '-100%' },
        {
          y: -barHeight,
          visibility: 'visible',
          duration: 0.4,
          ease: 'expo.inOut'
        }
      )
      .fromTo(
        elements.detailsEl,
        { opacity: 0 },
        { opacity: 1, duration: 0.45, ease: 'sine.inOut' },
        '>-0.2'
      )
      .fromTo(
        elements.detailsWrapperEl,
        { x: () => getDetailsOffset(modalRectRef.current) },
        {
          x: 0,
          duration: 0.5,
          ease: 'expo.inOut'
        },
        '<+0.05'
      )
      .fromTo(
        elements.formEl,
        { x: '-100%' },
        { x: 0, ease: 'expo.out', duration: 0.4 },
        '>-0.35'
      );

    return () => {
      animation.current?.invalidate();
    };
  }, [modalRect, modalRectRef, getDetailsOffset]);

  useEffect(() => {
    if (!animation.current) {
      setIsVisible(isOpen);
      return;
    }

    if (isOpen) {
      animation.current.play(undefined, false);
    } else {
      animation.current.reverse(undefined, false);
    }

    setIsAnimating(true);
    setIsVisible(isOpen);
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
