import styles from './Experience.module.scss';
import { Section, Content, GridLines } from '@elements';

export default function Experience() {
  return (
    <Section
      className={styles.wrapper}
      wrapContent={false}
    >
      <Content className={styles.content}>
        <h2>If your only tool is a hammer, every project looks like a nail</h2>
        <p>
          Vestibulum nec nulla rutrum nine years semper. Donec quis orci
          maximus, efficitur guam in, ultrices massa. Lorem ipsum dolor sit
          amet, consectetur adipiscing elit.{' '}
        </p>
      </Content>
      <GridLines
        solidColor="#262B3F"
        dashColor="#262B3F"
      />
    </Section>
  );
}
