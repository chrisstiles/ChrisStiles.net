import {
  memo,
  useEffect,
  useRef,
  useMemo,
  type SetStateAction,
  type Dispatch,
  type CSSProperties
} from 'react';
import styles from './Code.module.scss';
import useSyntaxHighlighting, { Language } from '@hooks/useSyntaxHighlighting';
import classNames from 'classnames';

export default memo(function Code({
  language,
  content,
  isVisible,
  numLines,
  setNumLines
}: CodeProps) {
  const { code, lines, currentLineIndex } = useSyntaxHighlighting(
    language,
    content
  );

  const prevNumLines = useRef(1);

  useEffect(() => {
    if (isVisible) {
      setNumLines(lines.length);
    } else {
      prevNumLines.current = numLines;
    }
  }, [isVisible, lines.length, numLines, setNumLines]);

  const lineNumberComponents = useMemo(() => {
    const linesArr = new Array(Math.max(1, lines?.length ?? 1));
    const baseDelay = 0;
    const iterationDelay = 15;

    let currentDelayIndex = isVisible ? 0 : linesArr.length;

    return lines.map((_, index) => {
      const style: CSSProperties = {};

      if (index === 0 || index <= prevNumLines.current - 1) {
        style.transition = 'none';
      } else if (index > prevNumLines.current - 1) {
        style.transitionDelay = `${
          baseDelay + currentDelayIndex * iterationDelay
        }ms`;

        currentDelayIndex = isVisible
          ? currentDelayIndex + 1
          : currentDelayIndex - 1;
      }

      return (
        <span
          key={index}
          className={classNames(styles.line, {
            [styles.currentLine]:
              currentLineIndex === index || linesArr.length === 1
          })}
        >
          <span
            className={styles.num}
            style={style}
          />
        </span>
      );
    });
  }, [lines, isVisible, currentLineIndex]);

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
              dangerouslySetInnerHTML={{
                __html: code ? code : '<span class="token caret"></span>'
              }}
            />
          </pre>
        </div>
        <div
          role="presentation"
          className={styles.lineNumbers}
        >
          {lineNumberComponents}
        </div>
      </div>
    </div>
  );
});

type CodeProps = {
  language: Language;
  content: string;
  isVisible: boolean;
  numLines: number;
  setNumLines: Dispatch<SetStateAction<number>>;
  children?: React.ReactNode;
};
