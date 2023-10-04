import styles from './GridLines.module.scss';
import { numColumns } from './GridLines';
import classNames from 'classnames';

export default function GridDivider({
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

type GridDividerProps = {
  columns?: number;
  className?: string;
  barColor?: string;
  outlineColor?: string;
  showOutline?: boolean;
  offsetLeft?: string | number;
  offsetRight?: string | number;
};
