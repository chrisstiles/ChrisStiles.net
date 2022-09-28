import {
  memo,
  useState,
  useCallback,
  type SetStateAction,
  type Dispatch
} from 'react';
import styles from './Hero.module.scss';
import Title from './Title';
import Headline, { type HeadlineStyleProps } from './Headline';
import Editor from './Editor';
import { Section } from '@elements';
import { getState } from '@helpers';

export default memo(function Hero({
  setHeaderBoundsVisible,
  setHeaderBullets,
  setAccentsVisible
}: HeroProps) {
  const [state, _setState] = useState(initialState);
  const setState: SetHeroStateFunction = useCallback((value, name) => {
    !!value && _setState(state => getState(state, value, name));
  }, []);

  return (
    <Section className={styles.wrapper}>
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
  titleText: 'this.developer = new ChrisStiles();',
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
  titleText: string;
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
