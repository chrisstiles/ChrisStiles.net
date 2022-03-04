import type { ReactNode } from 'react';
import Head from 'next/head';
import Content from '@elements/Content';

export default function Layout({
  title = 'Chris Stiles',
  description = 'Full stack software engineer and UI/UX designer',
  children,
  header
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content={description}
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
        />
      </Head>
      {header}
      <main id="main">{children}</main>
      <footer id="footer">
        <Content>© {new Date().getFullYear()} Chris Stiles</Content>
      </footer>
    </>
  );
}

type LayoutProps = {
  title?: string;
  description?: string;
  children?: ReactNode;
  header?: React.ReactNode;
};
