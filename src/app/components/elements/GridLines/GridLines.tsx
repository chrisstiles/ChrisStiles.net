import { memo, type HTMLProps } from 'react';
import styles, { maxGridCols } from './GridLines.module.scss';
import { Content, Line } from '@elements';
import classNames from 'classnames';

export const numColumns = parseInt(maxGridCols);

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
        <Line
          color={solidColor}
          className={styles.solid}
          isSolid
        />
      )}
      <Line
        color={dashColor}
        className={styles.dash}
      />
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
  showOutline = true,
  outlineColor = 'var(--page-background-color)',
  offsetLeft,
  offsetRight
}: GridDividerProps) {
  const circleStyle = {
    backgroundColor: barColor,
    boxShadow: showOutline ? `0 0 0 3px ${outlineColor}` : undefined
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
            <span
              className={styles.circle}
              style={circleStyle}
            />
            <span
              className={styles.circle}
              style={circleStyle}
            />
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
  showOutline?: boolean;
  offsetLeft?: string | number;
  offsetRight?: string | number;
};
