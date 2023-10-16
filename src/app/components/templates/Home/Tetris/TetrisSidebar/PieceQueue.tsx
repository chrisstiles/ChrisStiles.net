import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import styles from './TetrisSidebar.module.scss';
import SidebarHeading from './SidebarHeading';
import TetrisBoard from '../TetrisBoard';
import PieceIcon from '../PieceIcon';
import Tetromino from '../Tetromino';
import { Line } from '@elements';
import gsap from 'gsap';

export default function PieceQueue({ queue, game }: PieceQueueProps) {
  const itemsWrapper = useRef<HTMLDivElement>(null);
  const prevQueue = useRef(queue);
  const isNewGame = queue !== prevQueue.current && !!queue.length;
  const firstPiece = useRef<Tetromino>();
  const [dequeuedPieces, setDequeuedPieces] = useState<Tetromino[]>([]);

  if (isNewGame) {
    prevQueue.current = queue;
    firstPiece.current = queue[0];

    setDequeuedPieces([]);
  }

  const shouldAnimate = !isNewGame && firstPiece.current !== queue[0];

  if (
    shouldAnimate &&
    firstPiece.current &&
    !dequeuedPieces.includes(firstPiece.current)
  ) {
    setDequeuedPieces(dequeuedPieces.concat(firstPiece.current));
  }

  useEffect(() => {
    if (!itemsWrapper.current || !dequeuedPieces.length) return;

    firstPiece.current = queue[0];

    let isCurrentAnimation = true;
    const x = -33.333333 * dequeuedPieces.length;

    game.animate(itemsWrapper.current, {
      x: `${x}%`,
      duration: 0.5,
      ease: 'power3.out',
      onComplete() {
        if (!isCurrentAnimation || !itemsWrapper.current) return;

        gsap.killTweensOf(itemsWrapper.current);
        gsap.set(itemsWrapper.current, { x: 0 });

        flushSync(() => setDequeuedPieces([]));
      }
    });

    return () => {
      isCurrentAnimation = false;
    };
  }, [dequeuedPieces, queue, game]);

  const items = dequeuedPieces.concat(queue);

  return (
    <section className={styles.pieceQueueSection}>
      <SidebarHeading label="Next pieces" />
      <div className={styles.pieceQueueWrapper}>
        <div
          ref={itemsWrapper}
          className={styles.pieceQueue}
        >
          {items.map((piece, index) => (
            <div
              key={index}
              className={styles.pieceBoxWrapper}
            >
              <div className={styles.pieceBox}>
                <PieceIcon
                  shapeIndex={piece.shapeIndex}
                  className={styles.pieceIcon}
                />
              </div>
            </div>
          ))}
        </div>
        <div className={styles.pieceQueueTrack}>
          <Line
            className={styles.pieceQueueLine}
            direction="horizontal"
            color="var(--border-color)"
            strokeWidth={1.6}
            strokeDashArray="5 7"
          />
        </div>
      </div>
    </section>
  );
}

type PieceQueueProps = {
  game: TetrisBoard;
  queue: Tetromino[];
};
