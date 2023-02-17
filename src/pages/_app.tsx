import '@styles/main.scss';
import '@utils/polyfills';
import SquircleMask from '@images/squircle-mask.svg';
import { isSSR } from '@helpers';
import squircleModule from 'css-houdini-squircle/squircle.min.js';
import 'focus-visible';
import Head from 'next/head';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';

if (!isSSR()) {
  if ('paintWorklet' in CSS) {
    CSS.paintWorklet.addModule(squircleModule);
  } else {
    import('css-paint-polyfill').then(() => {
      CSS.paintWorklet?.addModule(squircleModule);
    });
  }
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? (page => page);

  return getLayout(
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, minimum-scale=1.0"
        />
      </Head>
      <Component {...pageProps} />
      <SquircleMask />
    </>
  );
}

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
