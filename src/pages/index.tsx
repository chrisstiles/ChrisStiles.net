import { memo, type ReactElement } from 'react';
import HomeTemplate from '@templates/Home';
import Layout from '@layouts';
import path from 'path';
import fs from 'fs';
import process from 'process';
import type { GetStaticPropsResult } from 'next';

export default function Home({ iconSprites, iconFileNames }: HomeProps) {
  return (
    <>
      <HomeTemplate iconFileNames={iconFileNames} />
      <SpriteSheet sprites={iconSprites} />
    </>
  );
}

const SpriteSheet = memo(function SpriteSheet({ sprites }: SpriteSheetProps) {
  return !sprites?.trim() ? null : (
    <svg
      id="icon-sprites"
      width="0"
      height="0"
    >
      <defs dangerouslySetInnerHTML={{ __html: sprites }} />
    </svg>
  );
});

Home.getLayout = function (page: ReactElement) {
  return <Layout wrapMainContent={false}>{page}</Layout>;
};

export async function getStaticProps(): Promise<
  GetStaticPropsResult<HomeProps>
> {
  const iconDirectory = path.join(
    process.cwd(),
    'src/app/components/templates/Home/icons'
  );

  const files = fs
    .readdirSync(iconDirectory)
    .filter(n => n.endsWith('.svg'))
    .map(n => n.replace('.svg', ''));

  const iconFileNames: string[] = [];

  const symbols = await Promise.all(
    files.map(async name => {
      const filePath = `${path.join(iconDirectory, name)}.svg`;
      const svg = (await fs.promises.readFile(filePath, 'utf8'))
        .replace(/(?:\r\n|\r|\n)/g, '')
        .trim();

      const viewBox = svg.match(/viewBox="((?:[\d.]+ ?){4})"/)?.[1];
      const content = svg
        .match(/<svg[^>]*>([\S\s]+)<\/svg>/)?.[1]
        ?.trim()
        .replace(/(?:\r\n|\r|\n)/g, '');

      if (!viewBox || !content) {
        console.log('Invalid logo icon', name);
        return '';
      } else {
        iconFileNames.push(name);
        return `<symbol id="icon-${name}" viewBox="${viewBox}">${content}</symbol>`.trim();
      }
    })
  );

  return {
    props: { iconFileNames, iconSprites: symbols.join('') }
  };
}

type HomeProps = {
  iconSprites?: string;
  iconFileNames: string[];
};

type SpriteSheetProps = {
  sprites?: string;
};
