import styles from './TetrisOverlay.module.scss';
import TetrisBoard from '../TetrisBoard';

export default function TetrisOverlay({ game }: TetrisOverlayProps) {
  return !game.isPaused ? null : (
    <div className={styles.wrapper}>
      <p>Paused</p>
    </div>
  );
}

type TetrisOverlayProps = {
  game: TetrisBoard;
};
