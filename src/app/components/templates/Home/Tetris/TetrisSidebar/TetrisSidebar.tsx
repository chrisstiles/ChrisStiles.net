import { useMemo } from 'react';
import styles from './TetrisSidebar.module.scss';

export default function TetrisSidebar({
  level = 1,
  score = 0,
  lines = 0,
  linesUntilNextLevel = 10
}: TetrisSidebarProps) {
  const { format } = useMemo(() => new Intl.NumberFormat(), []);

  return (
    <div className={styles.wrapper}>
      <h3>Sidebar content here</h3>
      <p>Level: {format(level)}</p>
      <p>Score: {format(score)}</p>
      <p>Lines: {format(lines)}</p>
      <p>Lines until next level: {format(linesUntilNextLevel)}</p>
    </div>
  );
}

type TetrisSidebarProps = {
  level: number;
  score: number;
  lines: number;
  linesUntilNextLevel: number;
};
