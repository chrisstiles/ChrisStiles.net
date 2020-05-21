import React from 'react';
import { Content } from '@layout';
import Logo from '@images/logo.svg';
import styles from './Header.module.scss';

export default function Header() {
  return (
    <Content tag="header" className={styles.header}>
      <Logo className={styles.logo} />
      <ul className={styles.items}>
        <li>Developer</li>
        <li>UI/UX Designer</li>
        <li>Creator</li>
      </ul>
    </Content>
  );
}
