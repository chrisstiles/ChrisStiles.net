import { useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import styles from './Tetris.module.scss';
import TetrisBoard from './TetrisBoard';
import TetrisHeadline from './TetrisHeadline';
import useIsVisible from '@hooks/useIsVisible';
import { useGlobalState } from '@templates/Home';
import { Section } from '@elements';
import classNames from 'classnames';

// TODO Implement high score system (icons/filters for mobile vs desktop)

export default function Tetris() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useMemo(() => new TetrisBoard(canvas), []);

  useSyncExternalStore(game.subscribe, game.getState, game.getState);

  const { modalIsOpen } = useGlobalState();
  const { ref } = useIsVisible({
    onChange: isVisible => (game.isVisible = isVisible && !modalIsOpen)
  });

  useEffect(() => {
    game.init();
    return () => game.destroy();
  }, [game]);

  return (
    <Section className={styles.wrapper}>
      <div
        ref={ref}
        className={classNames(styles.content, {
          'game-paused': game.isPaused,
          'game-over': game.isGameOver
        })}
      >
        <TetrisHeadline
          preview={game.preview}
          isGameOver={game.isGameOver}
          isBotPlaying={game.isBotPlaying}
        />
        <canvas
          tabIndex={-1}
          ref={canvas}
          className={styles.canvas}
        />
        <button
          style={{ position: 'absolute', top: 0, left: 0 }}
          onClick={() => {
            if (!game.isGameActive || game.isPaused) {
              canvas.current?.focus({ preventScroll: true });
              game.play();
            } else {
              game.pause();
            }
          }}
        >
          {game.isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </Section>
  );
}
