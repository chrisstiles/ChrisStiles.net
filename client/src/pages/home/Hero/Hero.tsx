import React from 'react';
import { Content } from '@layout';
import Title from './Title';
import Headline from './Headline';
import Editor from './Editor';
import styles from './Hero.module.scss';

export default function Hero() {
  return (
    <Content tag="section" className={styles.hero}>
      <div className={styles.content}>
        <Title />
        <Headline />
      </div>
      <Editor />
    </Content>
  );
}
