import styles from './Header.module.scss';
import Content from '@elements/Content';
import Logo from '@images/logo.svg';

export default function Header() {
  return (
    <Content
      tag="header"
      className={styles.header}
    >
      <Logo
        className={styles.logo}
        aria-label="Chris Stiles"
      />

      <ul className={styles.items}>
        <li>Software engineer</li>
        <li>UI/UX designer</li>
        <li>Creator</li>
      </ul>
    </Content>
  );
}
