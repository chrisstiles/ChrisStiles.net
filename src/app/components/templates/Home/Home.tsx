import { useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import Experience from './Experience';
import { GridLines } from '@elements';

export default function HomeTemplate({ iconFileNames }: HomeTemplateProps) {
  const [headerBullets, setHeaderBullets] = useState<string[]>([]);
  const [headerBoundsVisible, setHeaderBoundsVisible] = useState(false);

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
        />
        <Experience iconFileNames={iconFileNames} />
        <GridLines />
      </main>
    </>
  );
}

type HomeTemplateProps = {
  iconFileNames: string[];
};
