import { memo } from 'react';
import Tetris from './Tetris';
import { Section, H2 } from '@elements';

export default memo(function Game() {
  return (
    <Section>
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
