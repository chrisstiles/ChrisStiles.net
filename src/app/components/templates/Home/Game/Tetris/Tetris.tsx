import { useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import styles from './Tetris.module.scss';
import TetrisBoard from './TetrisBoard';
import useIsVisible from '@hooks/useIsVisible';
import { useGlobalState } from '@templates/Home';

export default function Tetris() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useMemo(() => new TetrisBoard(canvas), []);

  useSyncExternalStore(game.subscribe, game.getState, game.getState);

  const { modalIsOpen } = useGlobalState();
  const { ref: wrapper } = useIsVisible({
    onChange: isVisible => (game.isVisible = isVisible && !modalIsOpen)
  });

  useEffect(() => {
    game.init();
    return () => game.destroy();
  }, [game]);

  return (
    <div
      ref={wrapper}
      className={styles.wrapper}
    >
      <button
        onClick={() => {
          if (!game.isGameActive || game.isPaused) {
            canvas.current?.focus();
            game.play();
          } else {
            game.pause();
          }
        }}
      >
        {game.isPlaying ? 'Pause' : 'Play'}
      </button>
      <canvas
        tabIndex={-1}
        ref={canvas}
        className={styles.canvas}
      />
    </div>
  );
}
