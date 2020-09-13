import React, { useEffect, useRef, useMemo } from 'react';
import { html } from '@utils/codeFormatting';
import styles from './Code.module.scss';
import Prism from 'prismjs';
import 'prismjs/components/prism-scss';
import classNames from 'classnames';

export default function Code({
  language,
  content,
  isVisible
}: CodeProps) {
  const ref = useRef<HTMLElement>();
  const [code, lines] = useMemo((): [string, string[]] => {
    const code = html`${content}`;
    return [code, code.split('\n')];
  }, [content]);

  useEffect(() => {
    Prism.highlightElement(ref.current);
  }, [language, code]);

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
        >
          {code}
        </code>
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
