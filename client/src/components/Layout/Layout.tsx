import React from 'react';
import Content from './Content';
import './Layout.module.scss';

export default function Layout({ children, header }: LayoutProps) {
  return (
    <React.Fragment>
      <div id="page-wrapper">
        {header}
        <main id="main-content">{children}</main>
      </div>
      <footer id="footer">
        <Content>© {new Date().getFullYear()} Chris Stiles</Content>
      </footer>
    </React.Fragment>
  );
}

type LayoutProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
};
