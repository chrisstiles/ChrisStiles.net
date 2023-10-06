import { useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import styles from './Tetris.module.scss';
import TetrisBoard from './TetrisBoard';
import TetrisBox, { type TetrisBoxProps } from './TetrisBox';
import TetrisHeader from './TetrisHeader';
import TetrisSidebar from './TetrisSidebar';
import GamePad from './gamepad.svg';
import useIsVisible from '@hooks/useIsVisible';
import { useGlobalState } from '@templates/Home';
import { Section, Button, GridLines } from '@elements';
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
        <header>
          <TetrisBox
            className={styles.top}
            {...boxes.top}
          >
            <TetrisBox
              className={styles.header}
              {...boxes.header}
            >
              <TetrisHeader
                preview={game.preview}
                isGameOver={game.isGameOver}
                isBotPlaying={game.isBotPlaying}
              />
            </TetrisBox>
            <TetrisBox className={styles.play}>
              <h3 className={styles.playTitle}>Want to play?</h3>
              <Button
                className={styles.playButton}
                icon={<GamePad />}
                onClick={() => game.startNewGame(false)}
              >
                Start new game
              </Button>
            </TetrisBox>
          </TetrisBox>
        </header>

        <TetrisBox
          className={styles.content}
          {...boxes.content}
        >
          <TetrisBox
            className={styles.game}
            {...boxes.game}
          >
            <canvas
              tabIndex={-1}
              ref={canvas}
              className={styles.canvas}
            />
            <GridLines
              className={styles.grid}
              showSubGrid
            />
          </TetrisBox>

          <TetrisBox
            className={styles.sidebar}
            {...boxes.sidebar}
          >
            <TetrisSidebar
              level={game.level}
              score={game.score}
              lines={game.clearedLines}
              linesUntilNextLevel={game.linesUntilNextLevel}
              linesPerLevel={game.linesPerLevel}
            />
          </TetrisBox>
        </TetrisBox>
      </div>
    </Section>
  );
}

const boxes: { [key: string]: TetrisBoxProps } = {
  top: {
    border: ['top', 'right', 'left'],
    dots: ['top-right']
  },
  header: {
    border: ['bottom', 'right'],
    dots: ['top-right', 'top-left', 'bottom-left', 'bottom-right']
  },
  content: {
    border: ['left', 'right'],
    dots: 'bottom-left'
  },
  game: {
    border: ['right', 'bottom']
  },
  sidebar: {
    border: 'right',
    dots: ['bottom-left', 'bottom-right']
  }
};
