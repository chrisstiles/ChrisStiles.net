import styles from './ProjectHighlights.module.scss';
import type { ReactNode } from 'react';

export default function ProjectHighlights() {
  return (
    <>
      <Highlight
        headline="What is the point?"
        color="var(--red-accent-color)"
      >
        <p>
          Vestibulum nec nulla rutrum semper. Donec quis orci maximus, efficitur
          guam in, ultrices massa. Lorem dolor sit amet, consectetur adipiscing
          elit.
        </p>
      </Highlight>
      <Highlight
        headline="Why is this complicated?"
        color="var(--green-accent-color)"
      >
        <p>
          Vestibulum nec nulla rutrum semper. Donec quis orci maximus, efficitur
          guam in, ultrices massa. Lorem dolor sit amet, consectetur adipiscing
          elit.
        </p>
      </Highlight>
      <Highlight
        headline="How does it work?"
        color="var(--yellow-accent-color)"
      >
        <p>
          Vestibulum nec nulla rutrum semper. Donec quis orci maximus, efficitur
          guam in, ultrices massa. Lorem dolor sit amet, consectetur adipiscing
          elit.
        </p>
        <p>
          Donec quis orci maximus, efficitur guam in, ultrices massa. Lorem
          dolor sit amet nulla rutrum is orci maximus, efficitur.
        </p>
      </Highlight>
    </>
  );
}

function Highlight({ headline, color, children }: HighlightProps) {
  return (
    <div className={styles.highlight}>
      <h3>{headline}</h3>
      {children}
      <span
        className={styles.bullet}
        style={{ color }}
      />
    </div>
  );
}

type HighlightProps = {
  headline: string;
  color: string;
  children?: ReactNode;
};
