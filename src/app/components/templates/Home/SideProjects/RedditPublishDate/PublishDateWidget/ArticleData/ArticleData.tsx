import { useRef, useEffect, memo } from 'react';
import styles from './ArticleData.module.scss';
import ArticleMetadata from './ArticleMetadata';
import ArticleDetails from './ArticleDetails';
import ArticleCode from './ArticleCode';
import classNames from 'classnames';
import type { Article } from '../PublishDateWidget';

export default memo(function ArticleData({
  article: currentArticle
}: ArticleDataProps) {
  const prevArticle = useRef<Nullable<Article>>(null);

  useEffect(() => {
    if (currentArticle && !currentArticle.isLoading) {
      prevArticle.current = currentArticle;
    }
  }, [currentArticle]);

  // Continue showing previous article while new one is loading
  const article =
    currentArticle && (!currentArticle.isLoading || !prevArticle.current)
      ? currentArticle
      : prevArticle.current;

  return !article?.data ? null : (
    <div
      className={classNames(styles.wrapper, {
        [styles.loading]: currentArticle?.isLoading
      })}
    >
      <div className={styles.contentWrapper}>
        <ArticleMetadata article={article} />
        <ArticleDetails article={article} />
        <ArticleCode article={article} />
        {currentArticle &&
          !currentArticle.isLoading &&
          !currentArticle.data?.publishDate && <h2>No date found :(</h2>}
      </div>
    </div>
  );
});

export type ArticleDataProps = {
  article: Nullable<Article>;
};
