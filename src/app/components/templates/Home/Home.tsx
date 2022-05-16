import { useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import Experience from './Experience';
import Highlights from './Highlights';
import { GridLines } from '@elements';

export default function HomeTemplate({ iconFileNames }: HomeTemplateProps) {
  const [headerBullets, setHeaderBullets] = useState<string[]>([]);
  const [headerBoundsVisible, setHeaderBoundsVisible] = useState(false);
  const [accentsVisible, setAccentsVisible] = useState(false);

  return (
    <>
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
      </main>
      <GridLines />
    </>
  );
}

type HomeTemplateProps = {
  iconFileNames: string[];
};
