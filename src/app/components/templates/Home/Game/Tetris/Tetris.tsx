import { useEffect, useRef, useMemo } from 'react';
import styles from './Tetris.module.scss';
import TetrisBoard from './TetrisBoard';
import useIsVisible from '@hooks/useIsVisible';
import { useGlobalState } from '@templates/Home';

export default function Tetris() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useMemo(() => new TetrisBoard(canvas), []);
  const hasStarted = useRef(false);
  const { ref: wrapper, isVisible } = useIsVisible();
  const { modalIsOpen } = useGlobalState();

  game.isVisible = isVisible && !modalIsOpen;

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
      game.isBotPlaying = true;
      game.play();
    }
  }, [game, isVisible]);

  return (
    <div
      ref={wrapper}
      className={styles.wrapper}
    >
      {/* <button
        onClick={() => {
          if (!game.isGameActive || game.isPaused) {
            canvas.current?.focus();
            game.play();
          } else {
            game.pause();
          }
        }}
      >
        Toggle game
      </button> */}
      <canvas
        tabIndex={-1}
        ref={canvas}
        className={styles.canvas}
      />
    </div>
  );
}
