import styles from './ArticleData.module.scss';
import { DefaultFavicon } from './icons';
import { Spinner } from '@elements';
import { preventOrphanedWord } from '@helpers';
import classNames from 'classnames';
import type { ArticleDataProps } from './ArticleData';
import type { Article, ArticleData } from '../PublishDateWidget';

export default function ArticleMetadataWrapper({
  article,
  isClone
}: ArticleDataProps) {
  return !hasMetadata(article) ? null : (
    <MetaData
      article={article}
      isClone={isClone}
    />
  );
}

function MetaData({ article, isClone }: ArticleMetadataProps) {
  const { url, data, favicon } = article;
  const headline = data.title ?? data.organization ?? url.hostname;

  const description =
    !data.errorType || !data.description?.toLowerCase().includes('error')
      ? data.description
      : null;

  const subheadline =
    description ??
    (headline !== url.hostname
      ? url.origin
      : url.origin + url.pathname
    ).replace(/\/$/, '');

  return !headline ? null : (
    <a
      href={url.href}
      className={styles.metadata}
      target="_blank"
      rel="noreferrer"
      tabIndex={isClone ? -1 : undefined}
      aria-hidden={isClone}
    >
      <div
        className={classNames(styles.faviconWrapper, {
          [styles.dark]: favicon?.isDark,
          [styles.loading]: favicon?.isLoading,
          [styles.default]: favicon && !favicon.isLoading && favicon?.isFallback
        })}
      >
        {favicon?.url && !favicon?.isFallback && (
          <div className={styles.favicon}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              src={favicon.url}
              aria-hidden="true"
            />
          </div>
        )}
        <div className={styles.defaultFavicon}>
          <DefaultFavicon />
        </div>
        <Spinner
          isVisible={!!favicon?.isLoading}
          size={15}
        />
      </div>

      <div className={styles.text}>
        {(headline || subheadline) && (
          <div>
            {headline && <h3>{formatText(headline)}</h3>}
            {subheadline && headline && <p>{formatText(subheadline)}</p>}
          </div>
        )}
      </div>
    </a>
  );
}

type ArticleWithData = Article & {
  data: ArticleData;
};

type ArticleMetadataProps = ArticleDataProps & {
  article: ArticleWithData;
};

function hasMetadata(article?: Nullable<Article>): article is ArticleWithData {
  const data = article?.data;
  return (
    !article?.isLoading &&
    !!(data?.title || data?.organization || data?.description)
  );
}

// Interpolating the string into a template literal
// automatically decodes certain special characters
function formatText(str: Nullable<string>) {
  return !str ? null : preventOrphanedWord(`${str}`);
}
