import { useMemo, useState, useEffect } from 'react';
import styles from './TetrisSidebar.module.scss';
import SidebarHeading from './SidebarHeading';
import { Progress } from './icons';
import useIsMounted from '@hooks/useIsMounted';
import classNames from 'classnames';
import gsap from 'gsap';
import type { TetrisSidebarProps } from './TetrisSidebar';

export default function Score({
  game,
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
  const isMounted = useIsMounted();

  useEffect(() => {
    let timer: gsap.core.Tween;

    if (showAsComplete) {
      timer = gsap.delayedCall(0.8, () => {
        if (isMounted()) setPrevLevel(level);
      });

      game.timeline.add(timer, game.timeline.time());
    }

    return () => {
      timer?.kill();
    };
  }, [showAsComplete, level, isMounted, game]);

  if (level === 1 && prevLevel !== 1) setPrevLevel(1);

  const linesThisLevel = linesPerLevel - linesUntilNextLevel;
  const progress = showAsComplete ? 1 : linesThisLevel / linesPerLevel;

  const linesRemainingText = `${linesUntilNextLevel} ${
    linesUntilNextLevel === 1 ? 'line' : 'lines'
  }`;

  const progressText = `${
    showAsComplete ? 0 : progress * 100
  }% (${linesRemainingText} remaining)`;

  return (
    <section className={styles.scoreSection}>
      <SidebarHeading label="Score" />
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
          <label
            id="game-level-label"
            className={styles.levelText}
          >
            <span>Level</span>
            <strong className={styles.levelTitle}>{level}</strong>
          </label>
          <Progress className={styles.track} />
          <Progress
            className={styles.progress}
            role="progressbar"
            aria-labelledby="game-level-label"
            aria-valuetext={progressText}
            aria-valuemin={0}
            aria-valuemax={linesPerLevel}
          />
        </div>
        <div
          className={styles.levelNumLines}
          aria-hidden="true"
        >
          Next level: <strong>{linesRemainingText}</strong>
        </div>
      </div>
    </section>
  );
}
