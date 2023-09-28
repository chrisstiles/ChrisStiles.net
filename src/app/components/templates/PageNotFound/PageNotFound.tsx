import styles from './PageNotFound.module.scss';
import Icon from './404.svg';
import { Line, LinkButton } from '@elements';

export default function PageNotFoundTemplate() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <h2 className={styles.title}>Oops! Something went&nbsp;wrong</h2>
        <Icon className={styles.icon} />
      </div>
      <Line
        direction="horizontal"
        color="#4E5781"
      />
      <div className={styles.bottom}>
        <h1 className={styles.text}>
          The page you were looking for could not be&nbsp;found
        </h1>
        <LinkButton href="/">Back to home</LinkButton>
      </div>
      <CirclesBg />
    </div>
  );
}

function CirclesBg() {
  return (
    <div className={styles.circles}>
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className={styles.circle}
        />
      ))}
    </div>
  );
}
