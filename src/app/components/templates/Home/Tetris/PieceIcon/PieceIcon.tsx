import { memo } from 'react';
import styles from './PieceIcon.module.scss';
import pieces from '../pieces';
import classNames from 'classnames';

export default memo(function PieceIcon({
  shapeIndex,
  className,
  pieceClassName
}: PieceIconProps) {
  const piece = pieces[shapeIndex];
  const isLinePiece = shapeIndex === 0;
  const icon = isLinePiece
    ? [['■'], ['■'], ['■'], ['■']]
    : piece.shape
        .filter(row => row.some(value => !!value))
        .map(row => row.slice());

  return (
    <span
      className={classNames(styles.wrapper, className)}
      style={{
        '--cols': icon[0].length,
        '--color': piece.color
      }}
    >
      <span className={classNames(styles.piece, pieceClassName)}>
        {icon.map((row, rowIndex) => (
          <span
            key={rowIndex}
            className={styles.row}
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
      </span>
    </span>
  );
});

type PieceIconProps = {
  className?: string;
  pieceClassName?: string;
  shapeIndex: number;
};
