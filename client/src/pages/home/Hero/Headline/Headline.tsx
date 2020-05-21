import React from 'react';
import styles from './Headline.module.scss';

export default function Headline() {
  return (
    <h1 className={styles.headline}>
      Good ideas need
      <br /> <span>great</span> developers
    </h1>
  );
}
