import styles from './ArticleError.module.scss';
import ErrorIcon from './error.svg';
import type { ArticleDataProps } from '../ArticleData';

export default function ArticleError({ article }: ArticleDataProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <DashedLine />
        <div className={styles.lineVertical} />
      </div>
      <div className={styles.content}>
        <strong className={styles.type}>
          <ErrorIcon className={styles.icon} />
          Page not found
        </strong>
        <h4>Are you sure this is an article link?</h4>
        <p>
          Vestibulum nec nulla rutrum semper. Donec quis orci maximus, efficitur
          guam in, ultrices massa. Lorem dolor sit amet.
        </p>
      </div>
    </div>
  );
}

function DashedLine() {
  return (
    <svg
      viewBox="0 0 2 2"
      className={styles.lineHorizontal}
      preserveAspectRatio="none"
    >
      <line
        x1="0"
        y1="1"
        x2="2"
        y2="1"
        strokeWidth="2"
        strokeDasharray="4 5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
