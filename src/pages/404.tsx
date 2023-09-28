import PageNotFoundTemplate from '@templates/PageNotFound';
import Layout from '@layouts';
import type { ReactElement } from 'react';

export default function NotFound() {
  return <PageNotFoundTemplate />;
}

NotFound.getLayout = function (page: ReactElement) {
  return <Layout showFooter={false}>{page}</Layout>;
};
