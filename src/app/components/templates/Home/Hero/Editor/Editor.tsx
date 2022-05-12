import {
  memo,
  forwardRef,
  useCallback,
  useRef,
  useState,
  useMemo,
  useImperativeHandle,
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
  const typescriptTab = useRef<TabHandle>(null);
  const htmlTab = useRef<TabHandle>(null);
  const scssTab = useRef<TabHandle>(null);
  const mouse = useRef<HTMLDivElement>(null);

  const {
    typescript,
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
    typescriptTab,
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

  const views = useMemo<EditorView[]>(() => {
    return [
      {
        language: Language.TypeScript,
        ref: typescriptTab,
        label: 'scripts.ts'
      },
      {
        language: Language.HTML,
        ref: htmlTab,
        label: 'home.html'
      },
      {
        language: Language.SCSS,
        ref: scssTab,
        label: 'styles.scss'
      }
    ];
  }, []);

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

  const [tabComponents, codeComponents] = useMemo(() => {
    const tabComponents: JSX.Element[] = [];
    const codeComponents: JSX.Element[] = [];

    const visibleViewIndex = views.findIndex(
      ({ language }) => language === visibleView
    );

    const content: { [key in Language]?: string } = {
      html,
      scss,
      typescript
    };

    views.forEach(({ language, ref, label }, index) => {
      tabComponents.push(
        <Tab
          key={index}
          ref={ref}
          language={language}
          label={label}
          index={index}
          currentIndex={visibleViewIndex}
          onClick={handleButtonClick}
        />
      );

      codeComponents.push(
        <Code
          key={index}
          language={language}
          index={index}
          currentIndex={visibleViewIndex}
          content={content[language]!}
          numLines={numLines}
          setNumLines={setNumLines}
        />
      );
    });

    return [tabComponents, codeComponents];
  }, [views, visibleView, typescript, html, scss, numLines, handleButtonClick]);

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
        <div className={styles.tabs}>{tabComponents}</div>
      </div>
      <div className={styles.code}>{codeComponents}</div>
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
  { language, index, currentIndex, label, onClick },
  ref
) {
  const el = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useImperativeHandle(ref, () => ({ setIsHovered, el }));

  return (
    <div
      className={classNames(styles.tabWrapper, {
        [styles.hover]: isHovered,
        [styles.active]: index === currentIndex
      })}
      onClick={() => onClick(language)}
    >
      <button
        ref={el}
        tabIndex={-1}
        disabled
      >
        <svg aria-hidden="true">
          <use href={`#icon-${language}`} />
        </svg>
        {label}
      </button>
    </div>
  );
});

type EditorView = {
  language: Language;
  ref: RefObject<TabHandle>;
  label: string;
};

export type TabHandle = {
  setIsHovered(x: boolean): void;
  el: RefObject<HTMLButtonElement>;
};

type TabProps = {
  language: Language;
  label: string;
  index: number;
  currentIndex: number;
  onClick(x: Language): void;
};
