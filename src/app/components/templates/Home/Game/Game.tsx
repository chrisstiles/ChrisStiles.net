import { memo } from 'react';
import styles from './Game.module.scss';
import Tetris from './Tetris';
import { Section, H2 } from '@elements';

export default memo(function Game() {
  return (
    <Section className={styles.wrapper}>
      <H2
        align="center"
        eyebrow="Section headline"
      >
        Making modern applications is hard
      </H2>
      <Tetris />
    </Section>
  );
});
