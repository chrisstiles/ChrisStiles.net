import { memo } from 'react';
import styles from './ArticleData.module.scss';
import useSyntaxHighlighting, { Language } from '@hooks/useSyntaxHighlighting';
import classNames from 'classnames';

export default memo(function ArticleCode({ code, location }: ArticleCodeProps) {
  code = code?.trim() ?? '';

  const language =
    location?.toLowerCase().includes('structured') ||
    code.startsWith('{') ||
    code.match(/": ?(["])/)
      ? Language.JSON
      : Language.HTML;

  const { code: highlightedCode } = useSyntaxHighlighting(language, code);

  return !highlightedCode ? null : (
    <pre
      className={styles.codeWrapper}
      aria-hidden="true"
    >
      <code
        className={classNames(styles.code, `code-${language}`)}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </pre>
  );
});

type ArticleCodeProps = {
  code?: Nullable<string>;
  location?: Nullable<string>;
};
