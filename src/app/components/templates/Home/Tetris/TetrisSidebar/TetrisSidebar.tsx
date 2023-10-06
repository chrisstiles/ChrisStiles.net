import { memo, useMemo, useRef, useState, useEffect } from 'react';
import styles from './TetrisSidebar.module.scss';
import Progress from './progress.svg';
import classNames from 'classnames';

export default memo(function TetrisSidebar(props: TetrisSidebarProps) {
  return (
    <div className={styles.wrapper}>
      <Score {...props} />
    </div>
  );
});

function Score({
  level = 1,
  score = 0,
  lines = 0,
  linesPerLevel = 5,
  linesUntilNextLevel = 10
}: TetrisSidebarProps) {
  const { format } = useMemo(() => new Intl.NumberFormat(), []);

  // When the player levels up, show the progress bar
  // as 100% for a short time before resetting it to 0
  const [prevLevel, setPrevLevel] = useState(level);
  const showAsComplete = level > prevLevel;
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let timer: number;

    if (showAsComplete) {
      timer = window.setTimeout(() => {
        if (isMounted.current) setPrevLevel(level);
      }, 800);
    }

    return () => clearTimeout(timer);
  }, [showAsComplete, level]);

  if (level === 1 && prevLevel !== 1) setPrevLevel(1);

  const progress = showAsComplete
    ? 1
    : (linesPerLevel - linesUntilNextLevel) / linesPerLevel;

  return (
    <>
      <div className={classNames(styles.box, styles.scoreBox)}>
        <div className={styles.scoreTitle}>Points</div>
        <div className={styles.score}>{format(score)}</div>
      </div>
      <div className={classNames(styles.box, styles.scoreBox)}>
        <div className={styles.scoreTitle}>Lines</div>
        <div className={styles.score}>{format(lines)}</div>
      </div>
      <div className={styles.levelWrapper}>
        <div
          className={styles.level}
          style={{ '--progress': progress }}
        >
          <div className={styles.levelText}>
            <span>Level</span>
            <strong className={styles.levelTitle}>{level}</strong>
          </div>
          <Progress className={styles.track} />
          <Progress className={styles.progress} />
        </div>
        <div className={styles.levelNumLines}>
          Next level:{' '}
          <strong>
            {linesUntilNextLevel} {linesUntilNextLevel === 1 ? 'line' : 'lines'}
          </strong>
        </div>
      </div>
    </>
  );
}

type TetrisSidebarProps = {
  level: number;
  score: number;
  lines: number;
  linesPerLevel: number;
  linesUntilNextLevel: number;
};
