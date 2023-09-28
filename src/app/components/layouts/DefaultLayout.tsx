import Content from '@elements/Content';
import Head from 'next/head';
import type { ReactNode } from 'react';

export default function Layout({
  title = 'Chris Stiles',
  description = 'Full stack software engineer and UI/UX designer',
  pageClassName,
  children,
  header,
  wrapMainContent = true,
  showFooter = true
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content={description}
        />
      </Head>
      <div
        id="page-wrapper"
        className={pageClassName}
      >
        {header}
        {!wrapMainContent ? children : <main id="main">{children}</main>}
        {showFooter && (
          <footer id="footer">
            <Content>© {new Date().getFullYear()} Chris Stiles</Content>
          </footer>
        )}
      </div>
    </>
  );
}

type LayoutProps = {
  title?: string;
  description?: string;
  pageClassName?: string;
  children?: ReactNode;
  header?: React.ReactNode;
  wrapMainContent?: boolean;
  showFooter?: boolean;
};
