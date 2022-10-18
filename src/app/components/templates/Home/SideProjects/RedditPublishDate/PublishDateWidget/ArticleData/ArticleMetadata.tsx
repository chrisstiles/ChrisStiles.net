import { useState, useEffect, useRef } from 'react';
import styles from './ArticleData.module.scss';
import { DefaultFavicon } from './icons';
import useVariableRef from '@hooks/useVariableRef';
import { Spinner } from '@elements';
import { preventOrphanedWord } from '@helpers';
import classNames from 'classnames';
import type { ArticleDataProps } from './ArticleData';
import type { Article, ArticleData } from '../PublishDateWidget';

export default function ArticleMetadataWrapper({ article }: ArticleDataProps) {
  return hasMetadata(article) ? <MetaData article={article} /> : null;
}

function MetaData({ article }: { article: ArticleWithData }) {
  const articleRef = useVariableRef(article);
  const { url, data, favicon } = article;

  // Favicons have to first be loaded from API
  // and then the image has to be loaded by the browser
  const [hasImgError, setHasImgError] = useState(false);
  const [isLoadingImg, setIsLoadingImg] = useState(false);
  const isLoadingIcon = !hasImgError && !!(isLoadingImg || favicon?.isLoading);
  const hasFavicon = !!favicon?.url && !isLoadingIcon;

  const headline = data.title ?? data.organization ?? url.hostname;
  const subheadline =
    data.description ?? headline !== url.hostname
      ? url.origin
      : url.origin + url.pathname;

  useEffect(() => {
    if (!article.favicon?.url) {
      setIsLoadingImg(false);
      setHasImgError(false);
      return;
    }

    let loadingTimer: number;

    // Instantiate img to ensure load event fires
    const faviconUrl = article.favicon.url;
    const img = new Image();
    const handler = (event: Event) => {
      const currentFaviconUrl = articleRef.current?.favicon?.url;
      if (currentFaviconUrl && faviconUrl === currentFaviconUrl) {
        clearTimeout(loadingTimer);
        setIsLoadingImg(false);
        setHasImgError(event.type === 'error');
      }
    };

    if (!article.favicon?.url) {
      setIsLoadingImg(false);
    } else {
      img.addEventListener('load', handler);
      img.addEventListener('error', handler);
      img.src = faviconUrl;
      loadingTimer = window.setTimeout(() => setIsLoadingImg(true), 50);
    }

    return () => {
      clearTimeout(loadingTimer);
      img.removeEventListener('load', handler);
      img.removeEventListener('error', handler);
    };
  }, [article.favicon, articleRef]);

  return !headline ? null : (
    <a
      href={url.href}
      className={styles.metadata}
    >
      <div
        className={classNames(styles.faviconWrapper, {
          [styles.dark]: hasFavicon && favicon?.isDark,
          [styles.loading]: isLoadingIcon,
          [styles.default]: !hasFavicon
        })}
      >
        {favicon?.url && !isLoadingIcon && !hasImgError && (
          <div className={styles.favicon}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              src={favicon.url}
              width={24}
              height={24}
              aria-hidden="true"
            />
          </div>
        )}
        <div className={styles.defaultFavicon}>
          <DefaultFavicon />
        </div>
        <Spinner
          isVisible={isLoadingIcon}
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
