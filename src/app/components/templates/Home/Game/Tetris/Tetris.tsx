import { useEffect, useRef, useMemo } from 'react';
import styles from './Tetris.module.scss';
import TetrisBoard from './TetrisBoard';
import useIsVisible from '@hooks/useIsVisible';

export default function Tetris() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useMemo(() => new TetrisBoard(canvas), []);
  const hasStarted = useRef(false);
  const { ref: wrapper, isVisible } = useIsVisible();

  game.isVisible = isVisible;

  useEffect(() => {
    game.init();
    return () => {
      hasStarted.current = false;
      game.destroy();
    };
  }, [game]);

  useEffect(() => {
    if (!hasStarted.current && isVisible) {
      hasStarted.current = true;
      // game.isBotPlaying = true;
      game.play();
    }
  }, [game, isVisible]);

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
