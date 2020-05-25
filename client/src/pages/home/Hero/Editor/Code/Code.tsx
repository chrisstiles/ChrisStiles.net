import React, { useEffect, useRef } from 'react';
import { formatCode } from '@utils/codeFormatting';
import styles from './Code.module.scss';
import Prism from 'prismjs';
import classNames from 'classnames';

export default function Code({ language, content }: CodeProps) {
  const ref = useRef<HTMLElement>();

  useEffect(() => {
    Prism.highlightElement(ref.current);
  }, [language, content]);

  return (
    <pre className={classNames(styles.wrapper, 'line-numbers')}>
      <code ref={ref} className={`language-${language}`}>
        {formatCode(content)}
      </code>
    </pre>
  );
}

type CodeProps = {
  language: string;
  content: string;
};
