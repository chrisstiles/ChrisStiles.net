import styles from './RedditPublishDate.module.scss';
import ProjectHighlights from './ProjectHighlights';
import PublishDateWidget from './PublishDateWidget';
import Logo from './rpd.svg';
import { Section, H2, GridDivider } from '@elements';
import classNames from 'classnames';
import type { ReactNode } from 'react';

export default function RedditPublishDate() {
  return (
    <Section className={styles.wrapper}>
      <H2
        align="center"
        eyebrow={<Logo className={styles.logo} />}
      >
        What have I been up to lately?
      </H2>
      <ProjectHighlights />
      <div className={styles.contentWrapper}>
        <Column className={styles.content}>
          <p>
            Vestibulum nec nulla rutrum semper. Donec quis orci maximus,
            efficitur guam in, ultrices massa. Lorem dolor sit amet, consectetur
            adipiscing elit.
          </p>
          <GridDivider
            columns={6}
            className={styles.divider}
            outlineColor="var(--page-background-dark-color)"
          />
        </Column>
        <Column>
          <PublishDateWidget />
        </Column>
      </div>
    </Section>
  );
}

function Column({ className, children }: ColumnProps) {
  return <div className={classNames(styles.col, className)}>{children}</div>;
}

type ColumnProps = {
  className?: string;
  children: ReactNode;
};
