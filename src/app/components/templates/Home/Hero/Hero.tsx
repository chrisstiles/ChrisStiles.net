import { useState, useCallback } from 'react';
import styles from './Hero.module.scss';
import Title from './Title';
import Headline, { type HeadlineStyleProps } from './Headline';
import Editor from './Editor';
import { Content, Section } from '@elements';
import { getState } from '@helpers';

export default function Hero() {
  const [state, _setState] = useState(initialState);
  const setState: SetHeroStateFunction = useCallback((value, name) => {
    !!value && _setState(state => getState(state, value, name));
  }, []);

  return (
    <Section>
      <div className={styles.top}>
        <div className={styles.content}>
          <Title text={state.titleText} />
          <Headline
            text={state.headlineText}
            selectEmphasis={state.selectEmphasis}
            boldText={state.boldText}
            alternateGlyphs={state.alternateGlyphs}
            shrinkText={state.shrinkText}
            skewText={state.skewText}
            uppercaseText={state.uppercaseText}
            showSpanColor={state.showSpanColor}
            showBoundingBox={state.showBoundingBox}
          />
        </div>
        <Editor
          setState={setState}
          showSelectHighlight={state.showSelectHighlight}
        />
      </div>

      <Content className={styles.bottom}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </Content>
    </Section>
  );
}

const initialState: HeroState = {
  titleText: 'this.developer = new ChrisStiles();',
  headlineText: '',
  showSelectHighlight: false,
  selectEmphasis: false,
  boldText: false,
  alternateGlyphs: false,
  shrinkText: false,
  skewText: false,
  uppercaseText: false,
  showSpanColor: false,
  showBoundingBox: false
};

export type HeroState = HeadlineStyleProps & {
  titleText: string;
  headlineText: string;
  showSelectHighlight: boolean;
};

export type SetHeroStateFunction = (
  value?: Partial<HeroState>,
  name?: keyof HeroState
) => void;
