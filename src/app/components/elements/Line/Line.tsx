import styles from './Line.module.scss';
import classNames from 'classnames';

export default function Line({
  className,
  direction = 'vertical',
  color = 'var(--grid-line-color)',
  isSolid,
  strokeDashArray = '6 10',
  strokeWidth = 1
}: LineProps) {
  const isVertical = direction === 'vertical';
  const halfStrokeWidth = strokeWidth / 2;
  const strokeWidthStyle = strokeWidth !== 1 ? `${strokeWidth}px` : undefined;

  return (
    <svg
      viewBox={`0 0 ${strokeWidth} ${strokeWidth}`}
      preserveAspectRatio="none"
      style={{
        '--stroke-width': strokeWidthStyle
      }}
      className={classNames(
        isVertical ? styles.vertical : styles.horizontal,
        className
      )}
    >
      <line
        x1={isVertical ? halfStrokeWidth : 0}
        y1={isVertical ? 0 : halfStrokeWidth}
        x2={isVertical ? halfStrokeWidth : strokeWidth}
        y2={isVertical ? strokeWidth : halfStrokeWidth}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={isSolid ? undefined : strokeDashArray}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

type LineProps = {
  className?: string;
  direction?: 'horizontal' | 'vertical';
  color?: string;
  isSolid?: boolean;
  strokeDashArray?: string;
  strokeWidth?: number;
};
