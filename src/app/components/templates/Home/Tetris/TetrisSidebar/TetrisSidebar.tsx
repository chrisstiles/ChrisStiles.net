import { memo } from 'react';
import styles from './TetrisSidebar.module.scss';
import Player from './Player';
import Score from './Score';
import PieceQueue from './PieceQueue';
import Tetromino from '../Tetromino';
import TetrisBoard from '../TetrisBoard';

export default memo(function TetrisSidebar(props: TetrisSidebarProps) {
  const { game, pieceQueue } = props;

  return (
    <div className={styles.wrapper}>
      <Player {...props} />
      <Score {...props} />
      <PieceQueue
        game={game}
        queue={game.hasStarted ? pieceQueue : []}
      />
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
  pieceQueue: Tetromino[];
};
