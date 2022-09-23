import { memo, type HTMLProps } from 'react';
import styles from './GridLines.module.scss';
import { Content } from '@elements';
import classNames from 'classnames';

export default memo(function GridLines({
  className,
  dashColor = '#2d334a',
  solidColor = '#2d334a'
}: GridLinesProps) {
  const lines = Array.from({ length: 8 }, (_, index) => (
    <div
      key={index}
      className={classNames('grid-line', styles.line)}
    >
      {index === 0 && (
        <svg
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          className={styles.solid}
        >
          <line
            x1="0.5"
            y1="0"
            x2="0.5"
            y2="1"
            stroke={solidColor}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      <svg
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
      >
        <line
          x1="0.5"
          y1="0"
          x2="0.5"
          y2="1"
          stroke={dashColor}
          strokeWidth="1"
          strokeDasharray="6 10"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  ));

  return (
    <div
      className={classNames(styles.wrapper, className)}
      role="presentation"
    >
      <Content className={styles.linesWrapper}>
        <Grid>{lines}</Grid>
      </Content>
    </div>
  );
});

export function Grid({
  className,
  children,
  ...rest
}: HTMLProps<HTMLDivElement>) {
  return (
    <div
      className={classNames(styles.grid, className)}
      {...rest}
    >
      {children}
    </div>
  );
}

type GridLinesProps = {
  className?: string;
  dashColor?: string;
  solidColor?: string;
};
