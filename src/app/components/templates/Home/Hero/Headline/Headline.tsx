import { useMemo, memo, type ReactNode } from 'react';
import styles from './Headline.module.scss';
import BoundingBox from '../../BoundingBox';
import classNames from 'classnames';

export default memo(function Headline({
  text,
  selectEmphasis,
  boldText,
  alternateGlyphs,
  growText,
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
      aria-label="Good ideas need great developers"
      className={classNames(styles.headline, {
        [styles.empty]: !content,
        [styles.selectEmphasis]: selectEmphasis,
        [styles.showColor]: showSpanColor,
        [styles.bold]: boldText,
        [styles.alternateGlyphs]: alternateGlyphs,
        [styles.grow]: growText,
        [styles.skew]: skewText,
        [styles.uppercase]: uppercaseText
      })}
    >
      <span
        className={styles.content}
        aria-hidden="true"
      >
        {content}
      </span>
      <BoundingBox
        className={styles.box}
        isVisible={showBoundingBox}
      />
    </h1>
  );
});

export type HeadlineStyleProps = {
  selectEmphasis: boolean;
  boldText: boolean;
  alternateGlyphs: boolean;
  growText: boolean;
  skewText: boolean;
  uppercaseText: boolean;
  showSpanColor: boolean;
};

type HeadlineProps = HeadlineStyleProps & {
  text: string;
  showBoundingBox: boolean;
};
