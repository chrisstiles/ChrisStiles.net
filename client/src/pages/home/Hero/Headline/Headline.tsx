import React, { useMemo } from 'react';
import styles from './Headline.module.scss';
import classNames from 'classnames';

export default function Headline({
  text,
  showSpanColor
}: HeadlineProps) {
  const content = useMemo(() => {
    if (!text.trim()) {
      return text;
    }

    const content = text.split('need');

    if (content.length === 1) {
      return text;
    }

    const top = content[0] + 'need';
    content[1] = content[1].replace(/(good|great)/, '$1***');
    const bottom: React.ReactNodeArray = content[1].split('***');

    if (bottom.length > 1) {
      bottom[0] = <span key="span">{bottom[0]}</span>;
    }

    return [top, <br key="br" />, bottom].flat();
  }, [text]);

  return (
    <h1
      className={classNames(styles.headline, {
        [styles.showColor]: showSpanColor
      })}
    >
      {content}
    </h1>
  );
}

type HeadlineProps = {
  text: string;
  showSpanColor: boolean;
};
