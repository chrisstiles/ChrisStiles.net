import { memo } from 'react';
import styles from './TetrisSidebar.module.scss';
import Player from './Player';
import Score from './Score';
import TetrisBoard from '../TetrisBoard';

export default memo(function TetrisSidebar(props: TetrisSidebarProps) {
  return (
    <div className={styles.wrapper}>
      <Player {...props} />
      <Score {...props} />
    </div>
  );
});

export type TetrisSidebarProps = {
  game: TetrisBoard;
  isBotPlaying: boolean;
  level: number;
  score: number;
  lines: number;
  linesPerLevel: number;
  linesUntilNextLevel: number;
};
