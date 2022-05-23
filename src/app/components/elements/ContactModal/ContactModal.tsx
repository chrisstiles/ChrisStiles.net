import { useState, useEffect, useRef, type Dispatch } from 'react';
import { createPortal } from 'react-dom';
import styles from './ContactModal.module.scss';
import useClickOutside from '@hooks/useClickOutside';
import useEventListener from '@hooks/useEventListener';
import { H2, ContactForm } from '@elements';
import classNames from 'classnames';
import FocusLock from 'react-focus-lock';
import { RemoveScroll } from 'react-remove-scroll';

// TODO Add aria tags for modal

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
            >
              <div className={styles.form}>
                <ContactForm />
              </div>
              <div className={styles.details}>
                <H2
                  className={styles.headline}
                  eyebrow="Section headline"
                >
                  Vestibulum nec nulla rutrum nine semper
                </H2>
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
