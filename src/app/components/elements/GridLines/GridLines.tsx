import { memo, type HTMLProps } from 'react';
import styles from './GridLines.module.scss';
import { Content } from '@elements';
import classNames from 'classnames';

const numColumns = 12;

export default memo(function GridLines({
  className,
  dashColor = 'var(--grid-line-color)',
  solidColor = 'var(--grid-line-color)'
}: GridLinesProps) {
  const lines = Array.from({ length: numColumns }, (_, index) => (
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

export function GridDivider({
  columns,
  className,
  barColor,
  outlineColor,
  offsetLeft,
  offsetRight
}: GridDividerProps) {
  const circleStyle = {
    backgroundColor: barColor,
    boxShadow: outlineColor ? `0 0 0 3px ${outlineColor}` : undefined
  };

  return (
    <div className={classNames(styles.divider, className)}>
      <div className={styles.barWrapper}>
        <div
          className={styles.barSpacer}
          style={{ left: offsetLeft, right: offsetRight }}
        >
          <div
            className={classNames('bar', styles.bar)}
            style={{
              width: columns ? `${(100 / numColumns) * columns}%` : undefined,
              color: barColor
            }}
          >
            <span style={circleStyle} />
            <span style={circleStyle} />
          </div>
        </div>
      </div>
    </div>
  );
}

type GridLinesProps = {
  className?: string;
  dashColor?: string;
  solidColor?: string;
};

type GridDividerProps = {
  columns?: number;
  className?: string;
  barColor?: string;
  outlineColor?: string;
  offsetLeft?: string | number;
  offsetRight?: string | number;
};
