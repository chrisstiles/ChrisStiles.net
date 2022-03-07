import { useState, useCallback } from 'react';
import styles from './Hero.module.scss';
import Title from './Title';
import Headline from './Headline';
import Editor from './Editor';
import { Content, Section } from '@elements';
import { getState } from '@helpers';

export default function Hero() {
  const [state, _setState] = useState(initialState);
  const setState = useCallback((value: any, name?: keyof HeroState) => {
    _setState(state => getState(state, value, name));
  }, []);

  return (
    <Section>
      <div className={styles.top}>
        <div className={styles.content}>
          <Title text={state.titleText} />
          <Headline
            text={state.headlineText}
            selectSpan={state.selectSpan}
            boldText={state.boldText}
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
  selectSpan: false,
  boldText: false,
  shrinkText: false,
  skewText: false,
  uppercaseText: false,
  showSpanColor: false,
  showBoundingBox: true
};

type HeroState = {
  titleText: string;
  headlineText: string;
  showSelectHighlight: boolean;
  selectSpan: boolean;
  boldText: boolean;
  shrinkText: boolean;
  skewText: boolean;
  uppercaseText: boolean;
  showSpanColor: boolean;
  showBoundingBox: boolean;
};
