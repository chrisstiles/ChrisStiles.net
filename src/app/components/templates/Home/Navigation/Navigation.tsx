import { useState } from 'react';
import styles from './Navigation.module.scss';
import GitHub from './github.svg';
import LinkedIn from './linkedin.svg';
import { Button, ContactModal } from '@elements';

export default function Navigation() {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <>
      <nav className={styles.wrapper}>
        <ul>
          <li>
            <a
              href="https://github.com/chrisstiles"
              className={styles.linkedIn}
            >
              <GitHub />
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/christopherstiles/"
              className={styles.gitHub}
            >
              <LinkedIn />
            </a>
          </li>
          <li className={styles.cta}>
            <Button onClick={() => setModalIsOpen(true)}>Get in touch</Button>
          </li>
        </ul>
      </nav>
      <ContactModal
        isOpen={modalIsOpen}
        setIsOpen={setModalIsOpen}
      />
    </>
  );
}
