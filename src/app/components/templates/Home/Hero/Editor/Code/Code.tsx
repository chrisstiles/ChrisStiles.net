import { memo, useRef, useMemo } from 'react';
import styles from './Code.module.scss';
import useHasRendered from '@hooks/useHasRendered';
import Prism from 'prismjs';
import dedent from 'dedent';
import 'prismjs/components/prism-scss';
import classNames from 'classnames';
import { Language } from '@global';

interface Tokens {
  [key: string]: { pattern: RegExp };
}

const tokens: Tokens = {
  caret: {
    pattern: /\*\|\*/g
  },
  select: {
    pattern: /\(-(.*)-\)/
  }
};

export default memo(function Code({ language, content, isVisible }: CodeProps) {
  const hasRendered = useHasRendered();

  // Extend Prism's language grammar for custom functionality
  const grammar = useMemo(() => {
    return Prism.languages.extend(language, tokens);
  }, [language]);

  const [code, lines] = useMemo((): [string, string[]] => {
    const formattedCode = dedent(content);
    const lines = formattedCode.split('\n');

    if (!hasRendered) {
      return [formattedCode, lines];
    }

    let highlightedCode = Prism.highlight(formattedCode, grammar, language);

    Object.keys(tokens).forEach((key: keyof Tokens) => {
      const { pattern } = tokens[key];
      const match = highlightedCode.match(pattern);

      if (match) {
        if (match.length === 1 || pattern.flags.includes('g')) {
          // Replace contents with empty string
          highlightedCode = highlightedCode.replace(pattern, '');
        } else {
          // Replace with matched content
          for (let i = 1; i < match.length; i++) {
            highlightedCode = highlightedCode.replace(pattern, match[i]);
          }
        }
      }
    });

    return [highlightedCode, lines];
  }, [content, grammar, language, hasRendered]);

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
