import { useMemo, type ReactNode } from 'react';
import styles from './Headline.module.scss';
import classNames from 'classnames';

export default function Headline({
  text,
  selectSpan,
  boldText,
  shrinkText,
  skewText,
  uppercaseText,
  showSpanColor,
  showBoundingBox
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
    const bottom: ReactNode[] = content[1].split('***');

    if (bottom.length > 1) {
      bottom[0] = <span key="span">{bottom[0]}</span>;
    }

    return [top, <br key="br" />, bottom].flat();
  }, [text]);

  return (
    <h1
      className={classNames(styles.headline, {
        [styles.selectSpan]: selectSpan,
        [styles.showColor]: showSpanColor,
        [styles.bold]: boldText,
        [styles.shrink]: shrinkText,
        [styles.skew]: skewText,
        [styles.uppercase]: uppercaseText
      })}
    >
      <div className={styles.content}>{content}</div>
      <BoundingBox isVisible={showBoundingBox} />
    </h1>
  );
}

function BoundingBox({ isVisible = true }) {
  return !isVisible ? null : (
    <div className={styles.box}>
      <div className={styles.handle} />
      <div className={styles.handle} />
      <div className={styles.handle} />
      <div className={styles.handle} />
    </div>
  );
}

type HeadlineProps = {
  text: string;
  selectSpan: boolean;
  boldText: boolean;
  shrinkText: boolean;
  skewText: boolean;
  uppercaseText: boolean;
  showSpanColor: boolean;
  showBoundingBox: boolean;
};
