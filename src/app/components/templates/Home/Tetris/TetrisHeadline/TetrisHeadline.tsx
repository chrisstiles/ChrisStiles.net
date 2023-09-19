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
  const hasRendered = useHasRendered();
  const isLinePiece = preview.piece.shapeIndex === 0;

  const shape = useMemo(() => {
    // Display line piece vertically
    const shape = !isLinePiece ? preview.shape : [['■'], ['■'], ['■'], ['■']];

    return shape
      .filter(row => row.some(value => !!value))
      .map(row => row.slice());
  }, [preview, isLinePiece]);

  return !hasRendered ? (
    <>optimized</>
  ) : (
    <span
      className={classNames(styles.previewWrapper, {
        [styles.linePiece]: isLinePiece
      })}
      style={{
        '--cols': shape[0].length,
        color: hasRendered ? preview.color : undefined
      }}
      aria-hidden="true"
    >
      <span className={styles.piece}>
        {shape.map((row, rowIndex) => (
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
      <span className={styles.label}>{preview.currentLabel}</span>
    </span>
  );
}

type TetrisHeadlineProps = {
  preview: PiecePreview;
};
