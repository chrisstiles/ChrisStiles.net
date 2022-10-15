import { memo } from 'react';
import styles from './ArticleData.module.scss';
import ArticleMetadata from './ArticleMetadata';
import ArticleDetails from './ArticleDetails';
import ArticleCode from './ArticleCode';
import type { Article } from '../PublishDateWidget';
import type { FaviconResponse } from '@api/favicon';

export default memo(function ArticleData(props: ArticleDataProps) {
  if (!props.article?.data) return null;

  const { html, location } = props.article.data;

  return (
    <div className={styles.wrapper}>
      <ArticleMetadata {...props} />
      <ArticleDetails {...props} />
      <ArticleCode
        code={html}
        location={location}
      />
    </div>
  );
});

export type ArticleDataProps = {
  article: Nullable<Article>;
  favicon: Nullable<FaviconResponse>;
};
