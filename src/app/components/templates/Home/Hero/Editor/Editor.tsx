import React, {
  useCallback,
  useRef,
  useState,
  useImperativeHandle,
  type RefObject
} from 'react';
import styles from './Editor.module.scss';
import useHeroAnimation, { Language } from './useHeroAnimation';
import Code from './Code';
import classNames from 'classnames';

export default React.memo(function Editor({
  setState,
  showSelectHighlight = false
}: EditorProps) {
  const htmlTab = useRef<TabHandle>(null);
  const scssTab = useRef<TabHandle>(null);
  const mouse = useRef<HTMLDivElement>(null);

  const {
    currentView,
    html,
    scss,
    setCurrentView,
    isPlaying,
    isComplete,
    setIsPlaying
  } = useHeroAnimation({ setState, htmlTab, scssTab, mouse });

  const handleButtonClick = useCallback(
    (view: Language) => {
      setCurrentView(view);
      setIsPlaying(false);
    },
    [setCurrentView, setIsPlaying]
  );

  const mouseLeaveTimer = useRef<number>();
  const showCaretTimer = useRef<number>();

  // Show the caret before delay in resuming animation
  // after the user's mouse leaves the editor box
  const [forceCaretVisible, setForceCaretVisible] = useState(false);

  const handleMouseEnter = useCallback(() => {
    clearTimeout(mouseLeaveTimer.current);
    clearTimeout(mouseLeaveTimer.current);
    setForceCaretVisible(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(mouseLeaveTimer.current);
    clearTimeout(mouseLeaveTimer.current);

    if (!isPlaying && !isComplete) {
      const resumeDelay = 1000;

      showCaretTimer.current = window.setTimeout(() => {
        setForceCaretVisible(true);
      }, resumeDelay / 3);

      mouseLeaveTimer.current = window.setTimeout(() => {
        setIsPlaying(true);
        setForceCaretVisible(false);
      }, resumeDelay);
    }
  }, [isPlaying, isComplete, setIsPlaying]);

  return (
    <div
      className={classNames(styles.wrapper, {
        stopped: !isPlaying || isComplete,
        showCaret: !isComplete && forceCaretVisible,
        selectText: showSelectHighlight
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={mouse}
        className={styles.mouse}
      >
        <div className={styles.pulse} />
      </div>
      <div className={styles.top}>
        <span className={styles.dots} />
        <div className={styles.tabs}>
          <Tab
            ref={htmlTab}
            language={Language.HTML}
            currentView={currentView}
            onClick={handleButtonClick}
          >
            index.html
          </Tab>
          <Tab
            ref={scssTab}
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

type EditorProps = {
  setState: (value: any, name?: any) => void;
  showSelectHighlight: boolean;
};

const Tab = React.forwardRef<TabHandle, TabProps>(function Tab(
  { language, currentView, children, onClick },
  ref
) {
  const el = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useImperativeHandle(ref, () => ({ setIsHovered, el }));

  return (
    <button
      ref={el}
      className={classNames(styles.tab, {
        [styles.hover]: isHovered,
        [styles.active]: currentView === language
      })}
      onClick={() => onClick(language)}
    >
      {children}
    </button>
  );
});

export type TabHandle = {
  setIsHovered(x: boolean): void;
  el: RefObject<HTMLButtonElement>;
};

type TabProps = {
  language: Language;
  currentView: Language;
  children?: React.ReactNode;
  onClick(x: Language): void;
};
