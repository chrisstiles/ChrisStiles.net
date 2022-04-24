import {
  memo,
  forwardRef,
  useCallback,
  useRef,
  useState,
  useImperativeHandle,
  type ReactNode,
  type RefObject,
  type Dispatch,
  type SetStateAction
} from 'react';
import styles from './Editor.module.scss';
import useHeroAnimation from './useHeroAnimation';
import Code from './Code';
import classNames from 'classnames';
import { Language } from '@global';

export default memo(function Editor({
  showSelectHighlight = false,
  setState,
  setHeaderBoundsVisible,
  setHeaderBullets
}: EditorProps) {
  const htmlTab = useRef<TabHandle>(null);
  const scssTab = useRef<TabHandle>(null);
  const mouse = useRef<HTMLDivElement>(null);

  const {
    html,
    scss,
    hasStarted,
    isPlaying,
    isComplete,
    visibleView,
    play,
    pause,
    setVisibleView
  } = useHeroAnimation({
    setState,
    setHeaderBoundsVisible,
    setHeaderBullets,
    htmlTab,
    scssTab,
    mouse
  });

  const handleButtonClick = useCallback(
    (view: Language) => {
      setVisibleView(view);
      pause();
    },
    [setVisibleView, pause]
  );

  const mouseLeaveTimer = useRef<number>();
  const showCaretTimer = useRef<number>();

  // Show the caret before delay in resuming animation
  // after the user's mouse leaves the editor box
  const [forceCaretVisible, setForceCaretVisible] = useState(true);

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
        play(() => setForceCaretVisible(false));
      }, resumeDelay);
    }
  }, [isPlaying, isComplete, play]);

  const [numLines, setNumLines] = useState(1);

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={classNames('editor', styles.wrapper, {
        playing: isPlaying && !isComplete,
        paused: hasStarted && !isPlaying && !isComplete,
        complete: !isPlaying && isComplete,
        showCaret: isPlaying || (!isComplete && forceCaretVisible),
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
            currentView={visibleView}
            onClick={handleButtonClick}
          >
            index.html
          </Tab>
          <Tab
            ref={scssTab}
            language={Language.SCSS}
            currentView={visibleView}
            onClick={handleButtonClick}
          >
            styles.scss
          </Tab>
        </div>
      </div>
      <div className={styles.code}>
        <Code
          language={Language.HTML}
          isVisible={visibleView === Language.HTML}
          content={html}
          numLines={numLines}
          setNumLines={setNumLines}
        />
        <Code
          language={Language.SCSS}
          isVisible={visibleView === Language.SCSS}
          content={scss}
          numLines={numLines}
          setNumLines={setNumLines}
        />
      </div>
    </div>
  );
});

type EditorProps = {
  showSelectHighlight: boolean;
  setState: (value: any, name?: any) => void;
  setHeaderBoundsVisible: Dispatch<SetStateAction<boolean>>;
  setHeaderBullets: Dispatch<SetStateAction<string[]>>;
};

const Tab = forwardRef<TabHandle, TabProps>(function Tab(
  { language, currentView, children, onClick },
  ref
) {
  const el = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useImperativeHandle(ref, () => ({ setIsHovered, el }));

  return (
    <div
      className={classNames(styles.tabWrapper, {
        [styles.hover]: isHovered,
        [styles.active]: currentView === language
      })}
      onClick={() => onClick(language)}
    >
      <button
        ref={el}
        tabIndex={-1}
        disabled
      >
        <svg>
          <use href={`#icon-${language}`} />
        </svg>
        {children}
      </button>
    </div>
  );
});

export type TabHandle = {
  setIsHovered(x: boolean): void;
  el: RefObject<HTMLButtonElement>;
};

type TabProps = {
  language: Language;
  currentView: Language;
  children?: ReactNode;
  onClick(x: Language): void;
};
