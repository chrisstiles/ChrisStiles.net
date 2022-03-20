import { useMemo, type ReactNode } from 'react';
import styles from './Headline.module.scss';
import classNames from 'classnames';

export default function Headline({
  text,
  selectEmphasis,
  boldText,
  alternateGlyphs,
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
      bottom[0] = <em key="em">{bottom[0]}</em>;
    }

    return [top, <br key="br" />, bottom].flat();
  }, [text]);

  return (
    <h1
      className={classNames(styles.headline, {
        [styles.empty]: !content,
        [styles.selectEmphasis]: selectEmphasis,
        [styles.showColor]: showSpanColor,
        [styles.bold]: boldText,
        [styles.alternateGlyphs]: alternateGlyphs,
        [styles.shrink]: shrinkText,
        [styles.skew]: skewText,
        [styles.uppercase]: uppercaseText
      })}
    >
      <span className={styles.content}>{content}</span>
      <BoundingBox isVisible={showBoundingBox} />
    </h1>
  );
}

function BoundingBox({ isVisible = false }) {
  return (
    <div
      className={classNames(styles.box, {
        [styles.hidden]: !isVisible
      })}
    >
      <div className={styles.handle} />
      <div className={styles.handle} />
      <div className={styles.handle} />
      <div className={styles.handle} />
    </div>
  );
  // return !isVisible ? null : (
  //   <div className={styles.box}>
  //     <div className={styles.handle} />
  //     <div className={styles.handle} />
  //     <div className={styles.handle} />
  //     <div className={styles.handle} />
  //   </div>
  // );
}

export type HeadlineStyleProps = {
  selectEmphasis: boolean;
  boldText: boolean;
  alternateGlyphs: boolean;
  shrinkText: boolean;
  skewText: boolean;
  uppercaseText: boolean;
  showSpanColor: boolean;
  showBoundingBox: boolean;
};

type HeadlineProps = HeadlineStyleProps & {
  text: string;
};
