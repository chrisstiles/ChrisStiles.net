import { useEffect, type ReactElement, ReactNode } from 'react';
import '@styles/main.scss';
import '@utils/polyfills';
import SquircleMask from '@images/squircle-mask.svg';
import { isSSR } from '@helpers';
import 'focus-visible';
import Head from 'next/head';
import squircleModule from 'css-houdini-squircle/squircle.min.js';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? (page => page);

  useEffect(() => {
    if (!supportsPaintWorklets) {
      (async () => {
        await import('css-paint-polyfill');
        CSS.paintWorklet.addModule(squircleModule);
        document.body.classList.add('css-paint-loaded');
      })();
    }
  }, []);

  return getLayout(
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, minimum-scale=1.0"
        />
        <link
          rel="preload"
          href="/fonts/Mundial-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        ></link>
      </Head>
      <Component {...pageProps} />
      <SquircleMask />
    </>
  );
}

const supportsPaintWorklets = !isSSR() && CSS.paintWorklet;

if (supportsPaintWorklets) {
  CSS.paintWorklet.addModule(squircleModule);
  document.body.classList.add('css-paint-loaded');
}

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
