import { useMemo } from 'react';
import styles from './TetrisHeadline.module.scss';
import Tetromino from '../Tetromino';
import pieces from '../pieces';
import useHasRendered from '@hooks/useHasRendered';
import classNames from 'classnames';

export default function TetrisHeadline({ piece }: TetrisHeadlineProps) {
  const hasRendered = useHasRendered();
  const { color } = pieces[piece.shapeIndex];

  const label = hasRendered ? (
    <span style={{ color: hasRendered ? color : undefined }}>
      <PiecePreview piece={piece} />
      {piece.label}
    </span>
  ) : (
    'optimized'
  );

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.hidden]: !hasRendered
      })}
    >
      <h2>Making modern applications is hard</h2>
      <h3 className={styles.content}>
        <span className={styles.text}>Your website has to be</span> {label}
        {/* <span className={styles.text}>Your website has to be</span>{' '}
        {!hasRendered ? (
          'optimized'
        ) : (
          <span style={{ color: hasRendered ? color : undefined }}>
            <PiecePreview piece={piece} />
            {piece.label}
          </span>
        )} */}
      </h3>
    </div>
  );
}

function PiecePreview({ piece }: { piece: Tetromino }) {
  const shape = useMemo(() => {
    return piece.shape
      .filter(row => row.some(value => !!value))
      .map(row => row.slice());
  }, [piece]);

  return (
    <span className={styles.piece}>
      {/* {shape.map((row, rowIndex) => (
        
      )} */}
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
    </span>
  );
}

type TetrisHeadlineProps = {
  piece: Tetromino;
  // shapeIndex: number;
};
