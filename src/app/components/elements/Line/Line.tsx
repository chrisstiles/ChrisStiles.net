import styles from './Line.module.scss';
import classNames from 'classnames';

export default function Line({
  className,
  direction = 'vertical',
  color = 'var(--grid-line-color)',
  isSolid,
  strokeDashArray = '6 10'
}: LineProps) {
  const isVertical = direction === 'vertical';

  return (
    <svg
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      className={classNames(
        isVertical ? styles.vertical : styles.horizontal,
        className
      )}
    >
      <line
        x1={isVertical ? '0.5' : '0'}
        y1={isVertical ? '0' : '0.5'}
        x2={isVertical ? '0.5' : '1'}
        y2={isVertical ? '1' : '0.5'}
        stroke={color}
        strokeWidth="1"
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
};
