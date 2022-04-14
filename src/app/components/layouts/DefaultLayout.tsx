import Content from '@elements/Content';
import Head from 'next/head';
import type { ReactNode } from 'react';

export default function Layout(props: LayoutProps) {
  const {
    title = 'Chris Stiles',
    description = 'Full stack software engineer and UI/UX designer',
    children,
    header
  } = props;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content={description}
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
