import React, { useState, useCallback } from 'react';
import { Content, Section } from '@layout';
import Title from './Title';
import Headline from './Headline';
import Editor from './Editor';
import styles from './Hero.module.scss';
import { getState } from '@helpers';

export default function Hero() {
  const [state, _setState] = useState(initialState);
  const setState = useCallback(
    (value: any, name?: keyof HeroState) => {
      _setState(state => getState(state, value, name));
    },
    []
  );

  return (
    <Section>
      <div className={styles.top}>
        <div className={styles.content}>
          <Title text={state.titleText} />
          <Headline
            text={state.headlineText}
            showSpanColor={state.showSpanColor}
          />
        </div>
        <Editor setState={setState} />
      </div>

      <Content className={styles.bottom}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </Content>
    </Section>
  );
}

const initialState: HeroState = {
  titleText: '',
  headlineText: '',
  showSpanColor: false
};

type HeroState = {
  titleText: string;
  headlineText: string;
  showSpanColor: boolean;
};
