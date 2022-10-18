import { memo } from 'react';
import styles from './ArticleData.module.scss';
import useSyntaxHighlighting, { Language } from '@hooks/useSyntaxHighlighting';
import classNames from 'classnames';
import type { ArticleDataProps } from './ArticleData';

export default memo(function ArticleCode({ article }: ArticleDataProps) {
  const code = article?.data?.html?.trim() ?? '';

  const language =
    article?.data?.location?.toLowerCase().includes('structured') ||
    code.startsWith('{') ||
    code.match(/": ?(["])/)
      ? Language.JSON
      : Language.HTML;

  const { code: highlightedCode } = useSyntaxHighlighting(
    language,
    code,
    false
  );

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
