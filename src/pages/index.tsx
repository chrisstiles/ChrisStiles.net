import type { ReactElement } from 'react';
import HomeTemplate, { Header } from '@templates/Home';
import Layout from '@layouts';

export default function Home() {
  return <HomeTemplate />;
}

Home.getLayout = function (page: ReactElement) {
  return <Layout header={<Header />}>{page}</Layout>;
};
