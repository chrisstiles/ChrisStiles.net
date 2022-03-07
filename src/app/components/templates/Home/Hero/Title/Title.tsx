import { memo, useMemo } from 'react';
import styles from './Title.module.scss';
import useSyntaxHighlighting, { Language } from '@hooks/useSyntaxHighlighting';
import classNames from 'classnames';

export default memo(function Title({ text }: TitleProps) {
  const { code } = useSyntaxHighlighting(Language.JavaScript, text);

  return (
    <code
      className={classNames(styles.title, 'code-javascript')}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
});

type TitleProps = {
  text: string;
};
