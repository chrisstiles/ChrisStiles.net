import styles from './TetrisSidebar.module.scss';
import { GridDot } from '@elements';
import classNames from 'classnames';

export default function SidebarHeading({
  className,
  label
}: SidebarHeadingProps) {
  return (
    <h2 className={classNames(styles.heading, className)}>
      <span className={classNames(styles.headingLine, styles.left)}>
        <GridDot
          className={classNames(styles.dot, styles.leftDot, 'left-dot')}
        />
      </span>
      <span className={styles.headingText}>{label}</span>
      <span className={classNames(styles.headingLine, styles.right)}>
        <GridDot
          className={classNames(styles.dot, styles.rightDot, 'right-dot')}
        />
      </span>
    </h2>
  );
}

type SidebarHeadingProps = {
  className?: string;
  label: string;
};
