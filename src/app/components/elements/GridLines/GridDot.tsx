import styles from './GridLines.module.scss';
import classNames from 'classnames';
import type { CSSProperties } from 'react';

export default function GridDot({
  className,
  color,
  style = {}
}: GridDotProps) {
  return (
    <div
      className={classNames('grid-dot', styles.dot, className)}
      style={{
        ...style,
        '--dot-color': color
      }}
    />
  );
}

type GridDotProps = {
  className?: string;
  color?: string;
  style?: CSSProperties;
};
