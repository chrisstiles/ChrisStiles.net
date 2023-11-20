import styles from './RedditPublishDate.module.scss';
import ProjectFeatures from './ProjectFeatures';
import ProjectHighlights from './ProjectHighlights';
import PublishDateWidget from './PublishDateWidget';
import Logo from './rpd.svg';
import { Section, H2 } from '@elements';

export default function RedditPublishDate() {
  return (
    <Section className={styles.wrapper}>
      <div className={styles.top}>
        <H2
          align="center"
          eyebrow={<Logo className={styles.logo} />}
        >
          What I&apos;ve been working on
        </H2>
        <p>
          Reddit Publish Date is an API and Chrome extension that parses the
          content of news articles to determine when they were originally
          published
        </p>
      </div>
      <ProjectFeatures />
      <div className={styles.contentWrapper}>
        <div className={styles.content}>
          <ProjectHighlights />
        </div>

        <div className={styles.widget}>
          <PublishDateWidget />
        </div>
      </div>
    </Section>
  );
}
