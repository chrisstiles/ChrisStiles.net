import { useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import Experience from './Experience';
import { GridLines } from '@elements';

export default function HomeTemplate({ iconFileNames }: HomeTemplateProps) {
  const [headerBullets, setHeaderBullets] = useState<string[]>([]);

  return (
    <>
      <Header bullets={headerBullets} />
      <main id="main">
        <Hero setHeaderBullets={setHeaderBullets} />
        <Experience iconFileNames={iconFileNames} />
        <GridLines />
      </main>
    </>
  );
}

type HomeTemplateProps = {
  iconFileNames: string[];
};
