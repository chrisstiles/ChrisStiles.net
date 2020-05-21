import React from 'react';
import styles from './Title.module.scss';

export default function Title() {
  return (
    <code className={styles.title}>
      <span className={styles.red}>this</span>
      <span className={styles.grey}>.developer</span>
      <span className={styles.purple}>&nbsp;= new&nbsp;</span>
      <span className={styles.gold}>Chris Stiles</span>
      <span className={styles.grey}>()</span>
      <span className={styles.blue}>;</span>
    </code>
  );
}
