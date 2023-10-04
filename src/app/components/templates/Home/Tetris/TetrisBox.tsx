import styles from './Tetris.module.scss';
import { GridDot } from '@elements';
import classNames from 'classnames';
import type { ReactNode } from 'react';

export default function TetrisBox({
  className,
  border,
  dots,
  children
}: TetrisBoxProps) {
  const borderClassName = Array.isArray(border)
    ? border.join(' ')
    : border ?? '';

  const dotComponents = !dots
    ? null
    : (typeof dots === 'string' ? [dots] : dots).map((position, i) => (
        <GridDot
          key={`${position}-${i}`}
          className={classNames(styles.dot, position)}
        />
      ));

  return (
    <div className={classNames(styles.box, className)}>
      {children}
      <div className={classNames('border', styles.border, borderClassName)}>
        {dotComponents}
      </div>
    </div>
  );
}

type BorderSide = 'top' | 'right' | 'bottom' | 'left';
type DotPosition = 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left';

type TetrisBoxProps = {
  className?: string;
  border?: BorderSide | BorderSide[];
  dots?: DotPosition | DotPosition[];
  children?: ReactNode;
};
