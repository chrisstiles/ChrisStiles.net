import { useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import styles from './Tetris.module.scss';
import TetrisBoard from './TetrisBoard';
import TetrisBox from './TetrisBox';
import TetrisHeader from './TetrisHeader';
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
        className={classNames(styles.contentWrapper, {
          'game-paused': game.isPaused,
          'game-over': game.isGameOver
        })}
      >
        {/* <header> */}
        <TetrisBox
          className={styles.top}
          border={['top', 'right', 'left']}
          // dots={['top-right', 'top-left']}
          dots={['top-right']}
          // border={['right', 'left']}
        >
          <TetrisBox
            className={styles.header}
            border={['bottom', 'right']}
            // border="bottom"
            dots={['top-right', 'top-left', 'bottom-left', 'bottom-right']}
          >
            <TetrisHeader
              // className={styles.header}
              preview={game.preview}
              isGameOver={game.isGameOver}
              isBotPlaying={game.isBotPlaying}
            />
          </TetrisBox>
          <TetrisBox
            className={styles.play}
            // dots="top-right"
          >
            Play game here
          </TetrisBox>
        </TetrisBox>
        {/* </header> */}

        <TetrisBox
          className={styles.content}
          border={['left', 'right']}
          // dots="bottom-left"
          // border="left"
        >
          <TetrisBox
            className={styles.game}
            border="right"
            dots="bottom-left"
          >
            <canvas
              tabIndex={-1}
              ref={canvas}
              className={styles.canvas}
            />
          </TetrisBox>
          <TetrisBox
            className={styles.sidebar}
            border="right"
            dots={['bottom-left', 'bottom-right']}
            // border={['left', 'right']}
          >
            Right content
          </TetrisBox>
        </TetrisBox>

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
