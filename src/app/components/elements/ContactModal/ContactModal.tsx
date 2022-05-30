import { memo, useState, useEffect, useRef, type Dispatch } from 'react';
import { createPortal } from 'react-dom';
import styles from './ContactModal.module.scss';
import Close from './close.svg';
import useClickOutside from '@hooks/useClickOutside';
import useEventListener from '@hooks/useEventListener';
import useSize from '@hooks/useSize';
import { H2, ContactForm } from '@elements';
import gsap from 'gsap';
import classNames from 'classnames';
import FocusLock from 'react-focus-lock';
import { RemoveScroll } from 'react-remove-scroll';

// TODO Add sidebar contact details
// TODO Make this animation not suck
// TODO Calculate correct modal position when window resizes

export default memo(function ContactModal({
  isOpen,
  setIsOpen
}: ContactModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const modal = useRef<HTMLDivElement>(null);
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
  const detailsWrapper = useRef<HTMLDivElement>(null);
  const detailsBg = useRef<HTMLDivElement>(null);
  const details = useRef<HTMLDivElement>(null);
  const formWrapper = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLDivElement>(null);
  const { width: formWidth } = useSize(formWrapper) ?? {};

  useEffect(() => {
    const bgEl = bg.current;
    const detailsWrapperEl = detailsWrapper.current;
    const detailsBgEl = detailsBg.current;
    const detailsEl = details.current;
    const formEl = form.current;

    console.log('Here', formWidth);

    if (
      !formWidth ||
      !bgEl ||
      !detailsWrapperEl ||
      !detailsEl ||
      !detailsBgEl ||
      !formEl
    )
      return;

    animation.current = gsap.timeline({
      paused: true,
      onStart: () => setIsAnimating(true),
      onComplete: () => setIsAnimating(false),
      onReverseComplete: () => setIsAnimating(false)
    });

    animation.current.fromTo(
      detailsBgEl,
      { y: '-100%' },
      {
        y: 0,
        duration: () => (animation.current?.reversed() ? 0.4 : 0.6),
        ease: 'expo.inOut'
      }
    );

    animation.current.fromTo(
      bgEl,
      { opacity: 0 },
      {
        opacity: 0.95,
        duration: () => (animation.current?.reversed() ? 0.35 : 0.3)
      },
      '<+=0.1'
    );

    animation.current.fromTo(
      detailsEl,
      { opacity: 0 },
      { opacity: 1, duration: 0.35 },
      '<+0.15'
    );

    animation.current.fromTo(
      formEl,
      { x: '-100%' },
      { x: 0, ease: 'expo.out', duration: 0.3 },
      '-=0.05'
    );

    animation.current.fromTo(
      detailsWrapperEl,
      { x: Math.round(formWidth / 2) },
      {
        x: 0,
        duration: 0.5,
        ease: 'expo.inOut'
      },
      '<-=0.2'
    );

    return () => {
      animation.current?.kill();
    };
  }, [formWidth]);

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
              <div className={styles.detailsSpacer}>
                <div
                  ref={detailsWrapper}
                  className={styles.detailsWrapper}
                >
                  <div
                    ref={details}
                    className={styles.details}
                  >
                    <H2
                      className={styles.headline}
                      eyebrow="Contact me"
                      eyebrowId="contact-modal-title"
                    >
                      <span id="contact-modal-description">
                        I&apos;m looking forward to hearing from you
                      </span>
                    </H2>
                  </div>
                  <div
                    ref={detailsBg}
                    className={styles.detailsBg}
                  />
                </div>
              </div>
              <div
                ref={formWrapper}
                className={styles.formWrapper}
              >
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

type ContactModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<boolean>;
};
