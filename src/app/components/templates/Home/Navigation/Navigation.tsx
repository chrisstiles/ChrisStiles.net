import { memo, useContext, useRef } from 'react';
import styles from './Navigation.module.scss';
import GitHub from './github.svg';
import LinkedIn from './linkedin.svg';
import { HomeTemplateContext } from '@templates/Home';
import { Button, ContactModal } from '@elements';

export default memo(function Navigation() {
  const { modalIsOpen, setModalIsOpen } = useContext(HomeTemplateContext);
  const button = useRef<HTMLButtonElement>(null);

  return (
    <>
      <nav className={styles.wrapper}>
        <ul>
          <li>
            <a
              href="https://github.com/chrisstiles"
              className={styles.gitHub}
            >
              <GitHub className={styles.icon} />
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/christopherstiles"
              className={styles.linkedIn}
            >
              <LinkedIn className={styles.icon} />
            </a>
          </li>
          <li className={styles.cta}>
            <Button
              ref={button}
              onClick={() => {
                if (!modalIsOpen) setModalIsOpen(true);
              }}
            >
              Get in touch
            </Button>
          </li>
        </ul>
      </nav>
      <ContactModal
        openButton={button}
        isOpen={modalIsOpen}
        setIsOpen={setModalIsOpen}
      />
    </>
  );
});
