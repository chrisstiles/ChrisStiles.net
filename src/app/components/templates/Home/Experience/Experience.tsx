import { memo, useRef, type SetStateAction, type Dispatch } from 'react';
import styles from './Experience.module.scss';
import LogoAnimation from './LogoAnimation';
import BackgroundAccent from './BackgroundAccent';
import useSize from '@hooks/useSize';
import { Section, Content, H2, GridLines } from '@elements';

export default memo(function Experience({
  iconFileNames,
  accentsVisible,
  setAccentsVisible
}: ExperienceProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const wrapperRect = useSize(wrapper);

  return (
    <Section
      ref={wrapper}
      className={styles.wrapper}
      wrapContent={false}
    >
      <BackgroundAccent
        position="left"
        isVisible={accentsVisible}
      />
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
            <LogoAnimation
              iconFileNames={iconFileNames}
              wrapperRect={wrapperRect}
              setAccentsVisible={setAccentsVisible}
            />
          )}
        </Content>
        <GridLines
          className={styles.grid}
          solidColor="var(--grid-line-dark-color)"
          dashColor="var(--grid-line-dark-color)"
        />
      </div>
      <BackgroundAccent
        position="right"
        isVisible={accentsVisible}
        delay={0.8}
      />
    </Section>
  );
});

type ExperienceProps = {
  iconFileNames: string[];
  accentsVisible: boolean;
  setAccentsVisible: Dispatch<SetStateAction<boolean>>;
};
