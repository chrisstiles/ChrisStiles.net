import { useMemo } from 'react';
import styles from './TetrisHeader.module.scss';
import PiecePreview from '../PiecePreview';
import useHasRendered from '@hooks/useHasRendered';
import { BoundingBox } from '@elements';
import classNames from 'classnames';

export default function TetrisHeader({
  className,
  preview,
  isGameOver
}: TetrisHeaderProps) {
  const hasRendered = useHasRendered();

  // After a game over we finish typing the current label. To avoid a shift
  // in the label width, we hide the caret after the second to last character
  const shouldHideCursor =
    isGameOver && preview.currentLabel.length >= preview.label.length - 1;

  return (
    <div
      className={classNames(styles.wrapper, className, {
        [styles.hidden]: !hasRendered,
        [styles.hideCursor]: shouldHideCursor
      })}
    >
      <p className={styles.eyebrow}>Making modern applications is hard</p>
      <h2 className={styles.content}>
        <span className={styles.text}>Your website has to&nbsp;be</span>{' '}
        <PieceLabel preview={preview} />
      </h2>
    </div>
  );
}

function PieceLabel({ preview }: PiecePreviewProps) {
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
    <span className={styles.previewWrapper}>
      <span className={styles.label}>optimized</span>
    </span>
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
      aria-live="polite"
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
      <span
        className={classNames(styles.label, {
          [styles.empty]: !currentLabel
        })}
      >
        {currentLabel}
        <BoundingBox
          className={styles.boundingBox}
          isVisible
        />
      </span>
    </span>
  );
}

type TetrisHeaderProps = {
  className?: string;
  preview: PiecePreview;
  isGameOver: boolean;
  isBotPlaying: boolean;
};

type PiecePreviewProps = {
  preview: PiecePreview;
};