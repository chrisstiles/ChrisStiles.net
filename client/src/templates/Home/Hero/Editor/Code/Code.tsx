import React, { useRef, useMemo } from 'react';
import styles from './Code.module.scss';
import Prism from 'prismjs';
import dedent from 'dedent';
import 'prismjs/components/prism-scss';
import classNames from 'classnames';

interface Tokens {
  [key: string]: { pattern: RegExp };
}

const tokens: Tokens = {
  caret: {
    pattern: /\*\|\*/
  }
};

export default function Code({
  language,
  content,
  isVisible
}: CodeProps) {
  const ref = useRef<HTMLElement>();

  // Extend Prism's language grammar for custom functionality
  const grammar = useMemo(() => {
    return Prism.languages.extend(language, tokens);
  }, [language]);

  const [code, lines] = useMemo((): [string, string[]] => {
    const formattedCode = dedent(content);
    let highlightedCode = Prism.highlight(
      formattedCode,
      grammar,
      language
    );

    Object.keys(tokens).forEach((key: keyof Tokens) => {
      const regex = new RegExp(tokens[key].pattern, 'g');
      highlightedCode = highlightedCode.replace(regex, '');
    });

    return [highlightedCode, formattedCode.split('\n')];
  }, [content, grammar, language]);

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.visible]: isVisible
      })}
    >
      <pre className={styles.code}>
        <code
          ref={ref}
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: code }}
        />
        <div className={styles.lineNumbers}>
          {!lines.length ? (
            <span />
          ) : (
            lines.map((_, index) => <span key={index} />)
          )}
        </div>
      </pre>
    </div>
  );
}

type CodeProps = {
  language: string;
  content: string;
  isVisible: boolean;
  children?: React.ReactNode;
};
