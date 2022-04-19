import Hero from './Hero';
import Experience from './Experience';
import { GridLines } from '@elements';

export default function HomeTemplate({ iconFileNames }: HomeTemplateProps) {
  return (
    <>
      <Hero />
      <Experience iconFileNames={iconFileNames} />
      <GridLines />
    </>
  );
}

type HomeTemplateProps = {
  iconFileNames: string[];
};
