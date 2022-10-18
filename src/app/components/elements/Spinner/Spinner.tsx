import styles from './Spinner.module.scss';
import classNames from 'classnames';
import { isNumber } from 'lodash';
import type { ComponentProps, CSSProperties } from 'react';

const baseSize = parseInt(styles.baseSize);
const baseThickness = parseInt(styles.baseThickness);

export default function Spinner({
  size,
  className,
  svgClassName,
  color,
  thickness = baseThickness,
  isVisible = true
}: SpinnerProps) {
  const wrapperStyle: CSSProperties = { color };

  if (isNumber(size) && size !== baseSize) {
    wrapperStyle.width = size;
    wrapperStyle.height = size;
  }

  return !isVisible ? null : (
    <span
      className={classNames(styles.wrapper, className)}
      style={wrapperStyle}
      role="progressbar"
    >
      <svg
        className={classNames(styles.spinner, svgClassName)}
        viewBox={`${baseSize / 2} ${baseSize / 2} ${baseSize} ${baseSize}`}
      >
        <circle
          className={styles.circle}
          cx={baseSize}
          cy={baseSize}
          r={(baseSize - thickness) / 2}
          fill="none"
          strokeWidth={thickness}
        />
      </svg>
    </span>
  );
}

type SpinnerProps = ComponentProps<'div'> & {
  size?: number;
  svgClassName?: string;
  thickness?: number;
  isVisible?: boolean;
};
