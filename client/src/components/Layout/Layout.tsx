import React from 'react';
import './Layout.module.scss';

export default function Layout({ children }: LayoutProps) {
  return (
    <React.Fragment>
      <main>{children}</main>
      <footer>© {new Date().getFullYear()}</footer>
    </React.Fragment>
  );
}

type LayoutProps = {
  children: React.ReactNode;
};
