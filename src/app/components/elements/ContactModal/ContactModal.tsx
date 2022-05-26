import { useState, useEffect, useRef, type Dispatch } from 'react';
import { createPortal } from 'react-dom';
import styles from './ContactModal.module.scss';
import Close from './close.svg';
import useClickOutside from '@hooks/useClickOutside';
import useEventListener from '@hooks/useEventListener';
import { H2, ContactForm } from '@elements';
import classNames from 'classnames';
import FocusLock from 'react-focus-lock';
import { RemoveScroll } from 'react-remove-scroll';

export default function ContactModal({ isOpen, setIsOpen }: ContactModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const modal = useRef<HTMLDivElement>(null);

  useClickOutside(modal, () => setIsOpen(false));
  useEventListener('keydown', e => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      setIsOpen(false);
    }
  });

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
              <div className={styles.details}>
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
              <div className={styles.form}>
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
