import { memo } from 'react';
import styles from './Code.module.scss';
import useSyntaxHighlighting, { Language } from '@hooks/useSyntaxHighlighting';
import classNames from 'classnames';

export default memo(function Code({ language, content, isVisible }: CodeProps) {
  const { code, lines } = useSyntaxHighlighting(language, content);

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.visible]: isVisible
      })}
    >
      <div className={styles.contentWrapper}>
        <div className={styles.content}>
          <pre className={styles.codeWrapper}>
            <code
              className={classNames(styles.code, `code-${language}`)}
              dangerouslySetInnerHTML={{ __html: code }}
            />
          </pre>
        </div>
        <div
          role="presentation"
          className={styles.lineNumbers}
        >
          {!lines.length ? (
            <span />
          ) : (
            lines.map((_, index) => <span key={index} />)
          )}
        </div>
      </div>
    </div>
  );
});

type CodeProps = {
  language: Language;
  content: string;
  isVisible: boolean;
  children?: React.ReactNode;
};
