import React, { useCallback } from 'react';
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
    setIsPlaying
  } = useHeroAnimation();

  const handleButtonClick = useCallback(
    (view: Language) => {
      setCurrentView(view);
      setIsPlaying(false);
    },
    [setCurrentView, setIsPlaying]
  );

  return (
    <div
      className={styles.wrapper}
      onMouseLeave={() => setIsPlaying(true)}
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
