import {
  createContext,
  useState,
  useMemo,
  useRef,
  type Dispatch,
  type SetStateAction
} from 'react';
import Header from './Header';
import Hero from './Hero';
import Experience from './Experience';
import Tetris from './Tetris';
import { RedditPublishDate } from './SideProjects';
import useIsomorphicLayoutEffect from '@hooks/useIsomorphicLayoutEffect';
import { GridLines } from '@elements';
import { maxGridCols, maxGridOffset } from '@style-vars';
import ResizeObserver from 'resize-observer-polyfill';

export default function HomeTemplate({ iconFileNames }: HomeTemplateProps) {
  const [headerBullets, setHeaderBullets] = useState<string[]>([]);
  const [headerBoundsVisible, setHeaderBoundsVisible] = useState(false);
  const [accentsVisible, setAccentsVisible] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [gridState, setGridState] = useState(defaultGridState);
  const grid = useRef<HTMLDivElement>(null);

  const globalState = useMemo(() => {
    return { modalIsOpen, setModalIsOpen, grid: gridState };
  }, [modalIsOpen, gridState]);

  useIsomorphicLayoutEffect(() => {
    if (!grid.current) return;

    let prevWidth = 0;

    const observer = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;

      if (width === prevWidth || !grid.current) return;

      prevWidth = width;

      const style = getComputedStyle(grid.current);

      const numColumns =
        parseInt(style.getPropertyValue('--grid-cols')) ||
        defaultGridState.numColumns;

      const offset =
        parseInt(style.getPropertyValue('--grid-offset')) ||
        defaultGridState.offset;

      const gridWidth = grid.current.offsetWidth;

      setGridState({
        hasInitialized: true,
        width: gridWidth,
        columnWidth: gridWidth / numColumns,
        numColumns,
        offset
      });
    });

    observer.observe(grid.current);

    return () => observer.disconnect();
  }, []);

  return (
    <HomeTemplateContext.Provider value={globalState}>
      <Header
        showBoundingBox={headerBoundsVisible}
        bullets={headerBullets}
      />
      <main id="main">
        <Hero
          setHeaderBoundsVisible={setHeaderBoundsVisible}
          setHeaderBullets={setHeaderBullets}
          setAccentsVisible={setAccentsVisible}
        />
        <Experience
          iconFileNames={iconFileNames}
          accentsVisible={accentsVisible}
          setAccentsVisible={setAccentsVisible}
        />
        <Tetris />
        <RedditPublishDate />
      </main>
      <GridLines ref={grid} />
    </HomeTemplateContext.Provider>
  );
}

const defaultGridState: GridState = {
  hasInitialized: false,
  numColumns: parseInt(maxGridCols) || 13,
  offset: parseInt(maxGridOffset) || 20,
  columnWidth: 0,
  width: 0
};

export const HomeTemplateContext = createContext<HomeGlobalState>({
  modalIsOpen: false,
  setModalIsOpen: () => {},
  grid: defaultGridState
});

type HomeTemplateProps = {
  iconFileNames: string[];
};

export type HomeGlobalState = {
  modalIsOpen: boolean;
  setModalIsOpen: Dispatch<SetStateAction<boolean>>;
  grid: GridState;
};

export type GridState = {
  hasInitialized: boolean;
  width: number;
  numColumns: number;
  columnWidth: number;
  offset: number;
};
