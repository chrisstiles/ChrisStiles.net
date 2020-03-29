import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import Header from './Header';
import './layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  return (
    <React.Fragment>
      <Header siteTitle={data.site.siteMetadata.title} />

      <div
        style={{
          margin: `0 auto`,
          maxWidth: 960,
          padding: `0 1.0875rem 1.45rem`
        }}
      >
        <main>{children}</main>
        <footer>© {new Date().getFullYear()}</footer>
      </div>
    </React.Fragment>
  );
}
