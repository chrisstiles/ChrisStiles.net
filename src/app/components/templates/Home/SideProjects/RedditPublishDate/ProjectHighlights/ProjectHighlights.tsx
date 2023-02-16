import { memo } from 'react';
import styles from './ProjectHighlights.module.scss';

export default memo(function ProjectHighlights() {
  return (
    <div className={styles.wrapper}>
      <Highlight
        title="Highlight box title"
        text="Lorem  dolor sit amet, consectetur"
      />
      <Highlight
        title="Highlight box title"
        text="Lorem  dolor sit amet, consectetur"
      />
      <Highlight
        title="Highlight box title"
        text="Lorem  dolor sit amet, consectetur"
      />
      <Highlight
        title="Highlight box title"
        text="Lorem  dolor sit amet, consectetur"
      />
      <Highlight
        title="Highlight box title"
        text="Lorem  dolor sit amet, consectetur"
      />
      <Highlight
        title="Highlight box title"
        text="Lorem  dolor sit amet, consectetur"
      />
      <Highlight
        title="Highlight box title"
        text="Lorem  dolor sit amet, consectetur"
      />
    </div>
  );
});

function Highlight({ title, text }: HighlightProps) {
  return (
    <div className={styles.highlight}>
      <div className={styles.icon} />
      <div>
        <strong className={styles.title}>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

type HighlightProps = {
  title: string;
  text: string;
};
