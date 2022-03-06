import React, { useRef, useMemo } from 'react';
import styles from './Code.module.scss';
import { Language } from '../useHeroAnimation';
import useHasRendered from '@hooks/useHasRendered';
import Prism from 'prismjs';
import dedent from 'dedent';
import 'prismjs/components/prism-scss';
import classNames from 'classnames';

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

export default function Code({ language, content, isVisible }: CodeProps) {
  const hasRendered = useHasRendered();
  const ref = useRef<HTMLElement>(null);

  // Extend Prism's language grammar for custom functionality
  const grammar = useMemo(() => {
    return Prism.languages.extend(language, tokens);
  }, [language]);

  const [code, lines] = useMemo((): [string, string[]] => {
    const formattedCode = dedent(content);
    const lines = formattedCode.split('\n');

    if (!hasRendered || !isVisible) {
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
  }, [content, grammar, language, hasRendered, isVisible]);

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.visible]: isVisible
      })}
    >
      <pre className={styles.code}>
        {hasRendered && (
          <>
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
          </>
        )}
      </pre>
    </div>
  );
}

type CodeProps = {
  language: Language;
  content: string;
  isVisible: boolean;
  children?: React.ReactNode;
};
