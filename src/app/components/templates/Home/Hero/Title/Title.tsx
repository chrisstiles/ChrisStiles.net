import { useState, useEffect, useRef } from 'react';
import styles from './Title.module.scss';
import classNames from 'classnames';

export default function Title({
  terminalText = '',
  showMessage,
  isComplete
}: TitleProps) {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef<number>();

  useEffect(() => {
    clearTimeout(typingTimer.current);
    setIsTyping(true);

    typingTimer.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 50);
  }, [terminalText]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.photo}>{/* <PhotoMask /> */}</div>
      <div className={styles.content}>
        <strong className={styles.name}>Chris Stiles</strong>
        <code
          className={styles.console}
          role="presentation"
        >
          <span className={styles.dir}>cs@dev ~ %</span>
          <div
            className={classNames(styles.textWrapper, {
              [styles.showMessage]: showMessage,
              [styles.typing]: isTyping
            })}
          >
            <span className={styles.command}>{terminalText}</span>
            <span className={styles.message}>
              {isComplete ? (
                <>
                  <span className={styles.emoji}>✅</span>{' '}
                  <span className={styles.highlight}>Done</span> - welcome!
                </>
              ) : (
                <>
                  <span className={styles.spinner} /> Initializing…
                </>
              )}
            </span>
          </div>
        </code>
      </div>
    </div>
  );
}

type TitleProps = {
  terminalText: string;
  showMessage: boolean;
  isComplete: boolean;
};
