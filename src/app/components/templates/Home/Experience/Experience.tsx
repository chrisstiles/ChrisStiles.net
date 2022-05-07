import { memo } from 'react';
import styles from './Experience.module.scss';
import LogoAnimation from './LogoAnimation';
import BackgroundAccent from './BackgroundAccent';
import { Section, Content, H2, GridLines } from '@elements';

export default memo(function Experience({ iconFileNames }: ExperienceProps) {
  return (
    <Section
      className={styles.wrapper}
      wrapContent={false}
    >
      <div className={styles.contentWrapper}>
        <Content className={styles.content}>
          <div className={styles.text}>
            <H2 eyebrow="Experience matters">
              If your only tool is a hammer, every project looks like a nail
            </H2>

            <p>
              Vestibulum nec nulla rutrum nine years semper. Donec quis orci
              maximus, efficitur guam in, ultrices massa. Lorem ipsum dolor sit
              amet, consectetur adipiscing elit.
            </p>
          </div>
          {iconFileNames?.length && (
            <LogoAnimation iconFileNames={iconFileNames} />
          )}
        </Content>
        <GridLines
          className={styles.grid}
          solidColor="#262B3F"
          dashColor="#262B3F"
        />
      </div>
      <BackgroundAccent />
    </Section>
  );
});

type ExperienceProps = {
  iconFileNames: string[];
};
