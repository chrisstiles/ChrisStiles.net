import React, { useCallback, useRef, useState } from 'react';
import useHeroAnimation, { Language } from './useHeroAnimation';
import Code from './Code';
import styles from './Editor.module.scss';
import classNames from 'classnames';

export default React.memo(function Editor() {
  const {
    currentView,
    html,
    scss,
    setCurrentView,
    isPlaying,
    isComplete,
    setIsPlaying
  } = useHeroAnimation();

  const handleButtonClick = useCallback(
    (view: Language) => {
      setCurrentView(view);
      setIsPlaying(false);
    },
    [setCurrentView, setIsPlaying]
  );

  const mouseLeaveTimer = useRef(null);
  const showCaretTimer = useRef(null);

  // Show the caret before delay in resuming animation
  // after the user's mouse leaves the editor box
  const [forceCaretVisible, setForceCaretVisible] = useState(false);

  const handleMouseEnter = useCallback(() => {
    clearTimeout(mouseLeaveTimer.current);
    clearTimeout(showCaretTimer.current);
    setForceCaretVisible(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(mouseLeaveTimer.current);
    clearTimeout(showCaretTimer.current);

    if (!isPlaying && !isComplete) {
      const resumeDelay = 1000;

      showCaretTimer.current = setTimeout(() => {
        setForceCaretVisible(true);
      }, resumeDelay / 3);

      mouseLeaveTimer.current = setTimeout(() => {
        setIsPlaying(true);
        setForceCaretVisible(false);
      }, resumeDelay);
    }
  }, [isPlaying, isComplete, setIsPlaying]);

  return (
    <div
      className={classNames(styles.wrapper, {
        stopped: !isPlaying || isComplete,
        showCaret: !isComplete && forceCaretVisible
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // onMouseLeave={() => setIsPlaying(true)}
    >
      <div className={styles.top}>
        <span className={styles.dots} />
        <div className={styles.tabs}>
          <Tab
            language={Language.HTML}
            currentView={currentView}
            onClick={handleButtonClick}
          >
            index.html
          </Tab>
          <Tab
            language={Language.SCSS}
            currentView={currentView}
            onClick={handleButtonClick}
          >
            styles.scss
          </Tab>
        </div>
      </div>
      <div className={styles.code}>
        <Code
          language={Language.HTML}
          isVisible={currentView === Language.HTML}
          content={html}
        />
        <Code
          language={Language.SCSS}
          isVisible={currentView === Language.SCSS}
          content={scss}
        />
      </div>
      <div className={styles.terminal} />
    </div>
  );
});

type TabProps = {
  language: Language;
  currentView: Language;
  children?: React.ReactNode;
  onClick: (x: Language) => void;
};

function Tab({ language, currentView, children, onClick }: TabProps) {
  return (
    <button
      className={classNames(styles.tab, {
        [styles.active]: currentView === language
      })}
      onClick={() => onClick(language)}
    >
      {children}
    </button>
  );
}
