import {
  createContext,
  useState,
  useMemo,
  type Dispatch,
  type SetStateAction
} from 'react';
import Header from './Header';
import Hero from './Hero';
import Experience from './Experience';
import Highlights from './Highlights';
import { RedditPublishDate } from './SideProjects';
import { GridLines } from '@elements';

export default function HomeTemplate({ iconFileNames }: HomeTemplateProps) {
  const [headerBullets, setHeaderBullets] = useState<string[]>([]);
  const [headerBoundsVisible, setHeaderBoundsVisible] = useState(false);
  const [accentsVisible, setAccentsVisible] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const globalState = useMemo(() => {
    return { modalIsOpen, setModalIsOpen };
  }, [modalIsOpen]);

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
        <Highlights />
        <RedditPublishDate />
      </main>
      <GridLines />
    </HomeTemplateContext.Provider>
  );
}

type HomeTemplateProps = {
  iconFileNames: string[];
};

export const HomeTemplateContext = createContext<HomeGlobalState>({
  modalIsOpen: false,
  setModalIsOpen: _ => {}
});

export type HomeGlobalState = {
  modalIsOpen: boolean;
  setModalIsOpen: Dispatch<SetStateAction<boolean>>;
};
