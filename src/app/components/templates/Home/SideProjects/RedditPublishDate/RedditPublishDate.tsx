import styles from './RedditPublishDate.module.scss';
import PublishDateWidget from './PublishDateWidget';
import Logo from './rpd.svg';
import { Section, H2, GridDivider } from '@elements';
import classNames from 'classnames';
import type { ReactNode } from 'react';

export default function RedditPublishDate() {
  return (
    <Section
      className={styles.wrapper}
      contentClassName={styles.contentWrapper}
    >
      <Column className={styles.content}>
        <H2 eyebrow={<Logo className={styles.logo} />}>
          What have I been up to lately?
        </H2>
        <p>
          Vestibulum nec nulla rutrum semper. Donec quis orci maximus, efficitur
          guam in, ultrices massa. Lorem dolor sit amet, consectetur adipiscing
          elit.
        </p>
        <GridDivider outlineColor="var(--page-background-dark-color)" />
      </Column>
      <Column>
        <PublishDateWidget />
      </Column>
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
