import { useState, useEffect, useRef, useCallback, type Dispatch } from 'react';
import { createPortal } from 'react-dom';
import styles from './ContactModal.module.scss';
import Close from './close.svg';
import useClickOutside from '@hooks/useClickOutside';
import useEventListener from '@hooks/useEventListener';
import { H2, ContactForm } from '@elements';
import gsap from 'gsap';
import classNames from 'classnames';
import FocusLock from 'react-focus-lock';
import { RemoveScroll } from 'react-remove-scroll';

// TODO Add sidebar contact details

export default function ContactModal({ isOpen, setIsOpen }: ContactModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const modal = useRef<HTMLDivElement>(null);

  // const close = useCallback(() => {
  //   isAnimatingRef.current = true;
  //   setIsOpen(false);
  // }, [setIsOpen]);

  useClickOutside(modal, () => setIsOpen(false));
  useEventListener('keydown', e => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      setIsOpen(false);
    }
  });

  // useClickOutside(modal, close);
  // useEventListener('keydown', e => {
  //   if (e.key === 'Escape' || e.key === 'Esc') {
  //     close();
  //   }
  // });

  // Open/close animation
  // const [isAnimating, setIsAnimating] = useState(false);
  // const isAnimatingRef = useRef(false);
  // const hasStartedAnimating = useRef(false);
  // const animation = useRef<gsap.core.Timeline | null>(null);
  const divider = useRef<HTMLDivElement>(null);
  const details = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const dividerEl = divider.current;
  //   const detailsEl = details.current;
  //   const formEl = form.current;

  //   if (!dividerEl || !detailsEl || !formEl) return;

  //   const t1 = gsap.timeline({
  //     onStart: () => {
  //       console.log('start');
  //       isAnimatingRef.current = true;
  //       setIsAnimating(true);
  //     },
  //     onComplete: () => {
  //       console.log('end');
  //       isAnimatingRef.current = false;
  //       setIsAnimating(false);
  //     },
  //     onReverseComplete: () => {
  //       isAnimatingRef.current = false;
  //       console.log('reverse end');

  //       // console.log(isAnimatingRef.current, isOpen);

  //       setIsAnimating(false);
  //       setIsOpen(false);
  //     },
  //     // onUpdate: () => {
  //     //   isAnimatingRef.current = true;
  //     // },
  //     paused: true,
  //     smoothChildTiming: true
  //   });

  //   t1.to(
  //     dividerEl,
  //     // { scaleY: 0 },
  //     { scaleY: 1, ease: 'expo.inOut', duration: 0.6, delay: 0.1 }
  //   );

  //   const t2 = gsap.timeline();

  //   t2.to(
  //     detailsEl,
  //     // { x: '100%' },
  //     { x: 0, ease: 'expo.out', duration: 0.6 }
  //   );

  //   t2.to(
  //     formEl,
  //     // { x: '-100%' },
  //     { x: 0, ease: 'expo.out', duration: 0.6 },
  //     '-=0.6'
  //   );

  //   t1.add(t2, '-=0.1');

  //   animation.current = t1;
  // }, [setIsOpen]);

  // useEffect(() => {
  //   // const dividerEl = divider.current;
  //   // const detailsEl = details.current;
  //   // const formEl = form.current;
  //   // setIsAnimating(true);

  //   if (isOpen) {
  //     isAnimatingRef.current = true;
  //     setIsAnimating(true);
  //     // hasStartedAnimating.current = true;
  //     animation.current?.pause();
  //     animation.current?.play();
  //     animation.current?.restart();
  //     // if (!dividerEl || !detailsEl || !formEl) return;
  //     // const t1 = gsap.timeline();
  //     // t1.fromTo(
  //     //   dividerEl,
  //     //   { scaleY: 0 },
  //     //   { scaleY: 1, ease: 'expo.inOut', duration: 0.6, delay: 0.1 }
  //     // );
  //     // const t2 = gsap.timeline();
  //     // t2.fromTo(
  //     //   detailsEl,
  //     //   { x: '100%' },
  //     //   { x: 0, ease: 'expo.out', duration: 0.6 }
  //     // );
  //     // t2.fromTo(
  //     //   formEl,
  //     //   { x: '-100%' },
  //     //   { x: 0, ease: 'expo.out', duration: 0.6 },
  //     //   '-=0.6'
  //     // );
  //     // t1.add(t2, '-=0.1');
  //     // animation.current = t1;
  //   } else {
  //     // animation.current?.kill();
  //     animation.current?.pause();
  //     animation.current?.reverse();
  //     animation.current?.play();
  //   }

  //   // const timeline = animation.current;

  //   // return () => {
  //   //   timeline?.kill();
  //   // };
  // }, [isOpen, animation]);

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
              [styles.open]: isOpen
              // [styles.animating]: isAnimating || isAnimatingRef.current
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
                <div className={styles.detailsWrapper}>
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
                </div>
                <div
                  ref={divider}
                  className={styles.divider}
                />
              </div>
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
            <div className={styles.bg} />
          </RemoveScroll>
        </FocusLock>,
        document.body
      );
}

type ContactModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<boolean>;
};
