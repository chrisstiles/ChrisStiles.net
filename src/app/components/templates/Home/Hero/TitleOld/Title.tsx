import { memo, useMemo } from 'react';
import styles from './Title.module.scss';
import useSyntaxHighlighting, { Language } from '@hooks/useSyntaxHighlighting';
import classNames from 'classnames';

export default memo(function Title(props: TitleProps) {
  const { code } = useSyntaxHighlighting(
    Language.JavaScript,
    props.text,
    false
  );

  return (
    <div className={styles.titleWrapper}>
      <span
        className={styles.dollar}
        aria-hidden="true"
      />
      <code
        className={classNames(styles.title, 'code-javascript')}
        dangerouslySetInnerHTML={{ __html: code }}
      />
    </div>
  );
});

type TitleProps = {
  text: string;
};
