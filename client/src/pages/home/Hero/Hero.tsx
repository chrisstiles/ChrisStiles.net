import React from 'react';
import { Content, Section } from '@layout';
import Title from './Title';
import Headline from './Headline';
import Editor from './Editor';
import styles from './Hero.module.scss';

export default function Hero() {
  return (
    <Section>
      <div className={styles.top}>
        <div className={styles.content}>
          <Title />
          <Headline />
        </div>
        <Editor />
      </div>

      <Content className={styles.bottom}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </Content>
    </Section>
  );
}
