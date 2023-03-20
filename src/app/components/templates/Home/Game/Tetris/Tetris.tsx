import { useEffect, useRef, useMemo } from 'react';
import styles from './Tetris.module.scss';
import TetrisBoard from './TetrisBoard';
import Tetromino from './Tetromino';
import { useInView } from 'react-intersection-observer';

export default function Tetris() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const board = useMemo(() => {
    return new TetrisBoard(canvas);
  }, []);

  const { ref: wrapper, inView } = useInView({
    fallbackInView: true
  });

  board.isVisible = inView;

  useEffect(() => {
    board.init();
    board.play();
    board.piece = new Tetromino(board);

    return () => board.destroy();
  }, [board]);

  return (
    <div
      ref={wrapper}
      className={styles.wrapper}
    >
      <canvas
        ref={canvas}
        className={styles.canvas}
      />
    </div>
  );
}
