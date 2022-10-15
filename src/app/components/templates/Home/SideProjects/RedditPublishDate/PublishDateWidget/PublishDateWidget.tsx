import { useState, useRef, useCallback, memo } from 'react';
import styles from './PublishDateWidget.module.scss';
import ArticleTextField from './ArticleTextField';
import ArticleData from './ArticleData';
import useVariableRef from '@hooks/useVariableRef';
import useIsMounted from '@hooks/useIsMounted';
import { H3 } from '@elements';
import type { FaviconResponse } from '@api/favicon';

// TODO: Make widget accessible
// TODO: Add checks to limit cache size

export default memo(function PublishDateWidget() {
  const [article, _setArticle] = useState<Nullable<Article>>(null);
  const articleRef = useVariableRef(article);
  const cachedArticles = useRef<{ [key: string]: Article }>({});
  const [favicon, _setFavicon] = useState<Nullable<FaviconResponse>>(null);
  const cachedFavicons = useRef<{ [key: string]: FaviconResponse }>({});
  const fetchFaviconTimer = useRef<number>();
  const shouldDelayFetchingFavicon = useRef(true);
  const isMounted = useIsMounted();

  const setArticle = useCallback(
    (article: Nullable<Article>, forceUpdateState: boolean = true) => {
      // If the current article changed while a previous one's
      // data was being fetched, we only update the cached data
      const isCurrent = articleRef.current?.url.href === article?.url.href;
      const shouldUpdateState = isMounted() && (forceUpdateState || isCurrent);

      if (!article?.url) {
        if (shouldUpdateState) _setArticle(null);
        return;
      }

      article = { ...article };

      if (shouldUpdateState) _setArticle(article);
      cachedArticles.current[getCacheKey(article.url)] = article;
    },
    [articleRef, isMounted]
  );

  const setFavicon = useCallback(
    async (url: Nullable<URL>) => {
      clearTimeout(fetchFaviconTimer.current);

      // Althout techincally valid URLs, we do not attempt to fetch
      // favicons for URLs like "www.mydomain" while the user types
      if (!url || url.hostname.match(/www\.[^.]*$/)) {
        _setFavicon(null);
        return;
      }

      const cacheKey = url.hostname.replace('www.', '');

      if (cachedFavicons.current.hasOwnProperty(cacheKey)) {
        _setFavicon(cachedFavicons.current[cacheKey]);
      } else {
        const fetchFavicon = async () => {
          try {
            const apiUrl = `/api/favicon?url=${url.hostname}`;
            const res = await fetch(apiUrl);
            let favicon = await res.json();
            if (!favicon?.url) favicon = null;

            if (articleRef.current?.url.href === url.href) {
              _setFavicon(favicon);
            }

            cachedFavicons.current[cacheKey] = favicon;
          } catch {
            if (
              !articleRef.current ||
              articleRef.current.url.href === url.href
            ) {
              _setFavicon(null);
              return;
            }
          }
        };

        if (!shouldDelayFetchingFavicon.current) {
          fetchFavicon();
        } else {
          fetchFaviconTimer.current = window.setTimeout(fetchFavicon, 100);
        }

        shouldDelayFetchingFavicon.current = true;
      }
    },
    [articleRef]
  );

  const fetchArticleData = useCallback(
    async (article: Article) => {
      setArticle({ ...article, isLoading: true });

      try {
        const apiUrl = getEndpoint(article.url.href);
        const res = await fetch(apiUrl);
        const data = await res.json();

        setArticle({ ...article, data, isLoading: false }, false);
      } catch {
        const newArticle: Article = {
          ...article,
          isLoading: false,
          data: {
            ...initialArticleData,
            error: 'Unable to get article data',
            errorType: 'server'
          }
        };

        setArticle(newArticle, false);
      }
    },
    [setArticle]
  );

  const setUrl = useCallback(
    (url: Nullable<URL>) => {
      if (!url) {
        setArticle(null);
        setFavicon(null);
        return;
      }

      if (url.href === articleRef.current?.url.href) return;

      const cachedArticle = cachedArticles.current[getCacheKey(url)];

      if (cachedArticle) {
        setArticle(cachedArticle);
      } else {
        fetchArticleData({ url, data: null });
      }

      setFavicon(url);
    },
    [articleRef, setFavicon, setArticle, fetchArticleData]
  );

  return (
    <article className={styles.wrapper}>
      <H3 eyebrow="Publish date service">Try out my publish date API</H3>
      <ArticleTextField
        setUrl={setUrl}
        favicon={favicon}
        onPaste={() => (shouldDelayFetchingFavicon.current = false)}
      />
      <ArticleData
        article={article}
        favicon={favicon}
      />
    </article>
  );
});

function getEndpoint(url: string) {
  return `https://www.redditpublishdate.com/api/get-date?url=${url}`;
}

function getCacheKey(url: URL) {
  return url.hostname + url.pathname;
}

export type Article = {
  url: URL;
  isLoading?: boolean;
  data: Nullable<PublishDateApiResponse>;
};

export type PublishDateApiResponse = {
  organization?: Nullable<string>;
  title?: Nullable<string>;
  description?: Nullable<string>;
  publishDate?: Nullable<Date | string>;
  modifyDate?: Nullable<Date | string>;
  location?: Nullable<string>;
  html?: Nullable<string>;
  error?: Nullable<string>;
  errorType?: Nullable<'validation' | 'not-found' | 'server'>;
};

const initialArticleData: PublishDateApiResponse = {
  organization: null,
  title: null,
  description: null,
  publishDate: null,
  modifyDate: null,
  location: null,
  html: null,
  error: null,
  errorType: null
};
