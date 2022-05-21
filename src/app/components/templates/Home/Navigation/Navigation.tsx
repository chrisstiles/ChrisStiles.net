import styles from './Navigation.module.scss';
import GitHub from './github.svg';
import LinkedIn from './linkedin.svg';
import { Button } from '@elements';

export default function Navigation() {
  return (
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
          <Button>Get in touch</Button>
        </li>
      </ul>
    </nav>
  );
}
