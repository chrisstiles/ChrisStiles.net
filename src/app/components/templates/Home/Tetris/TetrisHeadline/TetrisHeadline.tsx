import { useMemo } from 'react';
import styles from './TetrisHeadline.module.scss';
import PiecePreview from '../PiecePreview';
import useHasRendered from '@hooks/useHasRendered';
import classNames from 'classnames';

export default function TetrisHeadline({ preview }: TetrisHeadlineProps) {
  const hasRendered = useHasRendered();

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.hidden]: !hasRendered
      })}
    >
      <h2>Making modern applications is hard</h2>
      <h3 className={styles.content}>
        <span className={styles.text}>Your website has to be</span>{' '}
        <PieceLabel preview={preview} />
      </h3>
    </div>
  );
}

function PieceLabel({ preview }: TetrisHeadlineProps) {
  const { piece, shape, color, label, currentLabel } = preview;

  const hasRendered = useHasRendered();
  const isLinePiece = piece.shapeIndex === 0;

  const icon = useMemo(() => {
    // Display line piece vertically
    if (isLinePiece) return [['■'], ['■'], ['■'], ['■']];

    return shape
      .filter(row => row.some(value => !!value))
      .map(row => row.slice());
  }, [shape, isLinePiece]);

  const isTyping = currentLabel && currentLabel !== label;

  return !hasRendered ? (
    <>optimized</>
  ) : (
    <span
      className={classNames(styles.previewWrapper, {
        [styles.linePiece]: isLinePiece,
        [styles.typing]: isTyping
      })}
      style={{
        '--cols': icon[0].length,
        color: hasRendered ? color : undefined
      }}
      aria-hidden="true"
    >
      <span className={styles.piece}>
        {icon.map((row, rowIndex) => (
          <span
            key={rowIndex}
            className={styles.blockRow}
          >
            {row.map((block, colIndex) => (
              <span
                key={colIndex}
                className={classNames(styles.block, {
                  [styles.filled]: !!block
                })}
              />
            ))}
          </span>
        ))}
      </span>{' '}
      <span className={styles.label}>{currentLabel}</span>
    </span>
  );
}

type TetrisHeadlineProps = {
  preview: PiecePreview;
};
