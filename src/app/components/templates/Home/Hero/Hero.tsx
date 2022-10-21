import {
  memo,
  useState,
  useCallback,
  useEffect,
  type SetStateAction,
  type Dispatch
} from 'react';
import styles from './Hero.module.scss';
import Title from './Title';
import Headline, { type HeadlineStyleProps } from './Headline';
import Editor from './Editor';
import { Section } from '@elements';
import { getState } from '@helpers';
import { useInView } from 'react-intersection-observer';

export default memo(function Hero({
  setHeaderBoundsVisible,
  setHeaderBullets,
  setAccentsVisible
}: HeroProps) {
  const [state, _setState] = useState(initialState);
  const setState: SetHeroStateFunction = useCallback((value, name) => {
    !!value && _setState(state => getState(state, value, name));
  }, []);

  const { ref, inView } = useInView({ fallbackInView: true });

  return (
    <Section
      ref={ref}
      className={styles.wrapper}
    >
      <div className={styles.top}>
        <div className={styles.content}>
          <Title
            terminalText={state.terminalText}
            showMessage={state.showTerminalMessage}
            isComplete={state.terminalLoadingComplete}
          />
          <Headline
            text={state.headlineText}
            selectEmphasis={state.selectEmphasis}
            boldText={state.boldText}
            alternateGlyphs={state.alternateGlyphs}
            growText={state.growText}
            skewText={state.skewText}
            uppercaseText={state.uppercaseText}
            showSpanColor={state.showSpanColor}
            showBoundingBox={state.headlineBoundsVisible}
          />
        </div>
        <Editor
          inView={inView}
          showSelectHighlight={state.showSelectHighlight}
          setState={setState}
          setHeaderBoundsVisible={setHeaderBoundsVisible}
          setHeaderBullets={setHeaderBullets}
          setAccentsVisible={setAccentsVisible}
        />
      </div>
    </Section>
  );
});

const initialState: HeroState = {
  terminalText: '',
  headlineText: '',
  showTerminalMessage: false,
  terminalLoadingComplete: false,
  showSelectHighlight: false,
  selectEmphasis: false,
  boldText: false,
  alternateGlyphs: false,
  growText: false,
  skewText: false,
  uppercaseText: false,
  showSpanColor: false,
  headlineBoundsVisible: false
};

type HeroProps = {
  setHeaderBoundsVisible: Dispatch<SetStateAction<boolean>>;
  setHeaderBullets: Dispatch<SetStateAction<string[]>>;
  setAccentsVisible: Dispatch<SetStateAction<boolean>>;
};

export type HeroState = HeadlineStyleProps & {
  terminalText: string;
  showTerminalMessage: boolean;
  terminalLoadingComplete: boolean;
  headlineText: string;
  showSelectHighlight: boolean;
  headlineBoundsVisible: boolean;
};

export type SetHeroStateFunction = (
  value?: Partial<HeroState>,
  name?: keyof HeroState
) => void;
