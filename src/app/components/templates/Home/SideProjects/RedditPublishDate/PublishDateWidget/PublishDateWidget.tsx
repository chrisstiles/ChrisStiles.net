import { useState, useRef, useCallback, useEffect, memo } from 'react';
import styles from './PublishDateWidget.module.scss';
import ArticleTextField from './ArticleTextField';
import ArticleData from './ArticleData';
import exampleArticlesData from './example-articles.json';
import useVariableRef from '@hooks/useVariableRef';
import useIsMounted from '@hooks/useIsMounted';
import { H3 } from '@elements';
import { isSameUrl } from '@helpers';
import { shuffle } from 'lodash';
import type { FaviconResponse } from '@api/favicon';

const exampleArticles = shuffle(exampleArticlesData);
const maxCacheSize = 30;

// TODO: Make widget accessible
// TODO: Add handling for both success/failure when searching root URLs
// TODO: Add custom text for each type of error
// TODO: Finalize text

export default memo(function PublishDateWidget() {
  const isMounted = useIsMounted();

  const [article, _setArticle] = useState<Nullable<Article>>(null);
  const articleRef = useVariableRef(article);
  const cachedArticles = useRef<Map<string, Nullable<Article>>>(new Map());
  const shouldDebounceArticle = useRef(true);
  const articleTimer = useRef<number>();

  const [favicon, _setFavicon] = useState<Nullable<Favicon>>(null);
  const cachedFavicons = useRef<Map<string, Nullable<Favicon>>>(new Map());
  const shouldDebounceFavicon = useRef(true);
  const faviconTimer = useRef<number>();

  const setArticle = useCallback(
    (article: Nullable<Article>, forceUpdateState: boolean = true) => {
      // If the current article changed while a previous one's
      // data was being fetched, we only update the cached data
      const shouldUpdateState =
        isMounted() &&
        (forceUpdateState || isSameUrl(articleRef.current, article));

      if (!article?.url) {
        if (shouldUpdateState) _setArticle(null);
        return;
      }

      const faviconCacheKey = getFaviconCacheKey(article.url);
      const favicon = cachedFavicons.current.has(faviconCacheKey)
        ? cachedFavicons.current.get(faviconCacheKey)
        : { isLoading: true, url: '' };

      article = { favicon, ...article };

      if (shouldUpdateState) _setArticle(article);

      if (cachedArticles.current.size >= maxCacheSize) {
        Array.from(cachedArticles.current.keys())
          .slice(0, Math.floor(maxCacheSize / 2))
          .forEach(k => cachedArticles.current.delete(k));
      }

      cachedArticles.current.set(getArticleCacheKey(article.url), article);
    },
    [articleRef, isMounted]
  );

  const setFavicon = useCallback(
    async (
      url: Nullable<URL>,
      isPreload?: boolean,
      callback?: (favicon: Nullable<Favicon>) => void
    ) => {
      if (!isPreload) clearTimeout(faviconTimer.current);

      // Although techincally valid URLs, we do not attempt to fetch
      // favicons for URLs like "www.mydomain" while the user types
      if (!url || url.hostname.match(/www\.[^.]*$/)) {
        _setFavicon(null);
        return;
      }

      const faviconCacheKey = getFaviconCacheKey(url);
      const articleCacheKey = getArticleCacheKey(url);

      const updateFavicon = (
        favicon: Nullable<Favicon>,
        forceUpdate?: boolean
      ) => {
        favicon = favicon ? { ...favicon } : favicon;

        if (forceUpdate || isSameUrl(articleRef.current?.url, url)) {
          _setFavicon(favicon);
        }

        if (cachedFavicons.current.size >= maxCacheSize) {
          Array.from(cachedFavicons.current.keys())
            .slice(0, Math.floor(maxCacheSize / 2))
            .forEach(k => cachedFavicons.current.delete(k));
        }

        cachedFavicons.current.set(faviconCacheKey, favicon);

        const cachedArticle = cachedArticles.current.get(articleCacheKey);

        if (cachedArticle) {
          const article = { ...cachedArticle, favicon };
          cachedArticles.current.set(articleCacheKey, article);
          setArticle(article);
        }
      };

      const cachedFavicon = cachedFavicons.current.get(faviconCacheKey);

      if (cachedFavicon) {
        updateFavicon(cachedFavicon, !isPreload);
        callback?.(cachedFavicon);
      } else {
        const getFavicon = async () => {
          updateFavicon({ isLoading: true, url: '' });

          try {
            const apiUrl = `/api/favicon?url=${url.hostname}`;
            const res = await fetch(apiUrl);
            let favicon = await res.json();

            updateFavicon(favicon);
            callback?.(favicon);
          } catch {
            if (!articleRef.current || isSameUrl(articleRef.current, url)) {
              updateFavicon(null);
              callback?.(null);
            }
          }
        };

        if (!shouldDebounceFavicon.current) {
          getFavicon();
        } else {
          faviconTimer.current = window.setTimeout(getFavicon, 100);
        }

        shouldDebounceFavicon.current = true;
      }
    },
    [articleRef, setArticle]
  );

  const fetchArticleData = useCallback(
    async (article: Article) => {
      clearTimeout(articleTimer.current);

      const fetchArticle = async () => {
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
      };

      if (!shouldDebounceArticle.current) {
        fetchArticle();
      } else {
        articleTimer.current = window.setTimeout(fetchArticle, 400);
      }

      shouldDebounceArticle.current = true;
    },
    [setArticle]
  );

  const setUrl = useCallback(
    (url: Nullable<URL>, immediate?: boolean) => {
      if (!url) {
        setArticle(null);
        setFavicon(null);
        return;
      }

      if (immediate) {
        shouldDebounceArticle.current = false;
        shouldDebounceFavicon.current = false;
      }

      if (isSameUrl(url, articleRef.current)) return;

      const cachedArticle = cachedArticles.current.get(getArticleCacheKey(url));

      if (cachedArticle) {
        setArticle(cachedArticle);
      } else {
        fetchArticleData({ url, data: null });
      }

      setFavicon(url);
    },
    [articleRef, setFavicon, setArticle, fetchArticleData]
  );

  const randomArticles = useRef(exampleArticles.slice());
  const shouldPreloadFavicon = useRef(true);

  const preloadFavicon = useCallback(
    async (url?: string) => {
      if (!url || !shouldPreloadFavicon.current) return;

      setFavicon(new URL(url), true, favicon => {
        if (!favicon) return;
        const img = new Image();
        img.src = favicon.url;
      });
    },
    [setFavicon]
  );

  useEffect(() => {
    preloadFavicon(randomArticles.current[randomArticles.current.length - 1]);
  }, [preloadFavicon]);

  const setRandomArticle = useCallback(() => {
    if (shouldPreloadFavicon.current && randomArticles.current.length <= 1) {
      shouldPreloadFavicon.current = false;
    }

    if (!randomArticles.current.length) {
      randomArticles.current = exampleArticles.slice();
    }

    setUrl(new URL(randomArticles.current.pop()!), true);

    if (shouldPreloadFavicon.current) {
      const url = randomArticles.current[randomArticles.current.length - 1];
      preloadFavicon(url);
    }
  }, [setUrl, preloadFavicon]);

  return (
    <article className={styles.wrapper}>
      <H3 eyebrow="Publish date service">Try out my publish date API</H3>
      <ArticleTextField
        article={article}
        favicon={favicon}
        setUrl={setUrl}
        setRandomArticle={setRandomArticle}
        onPaste={() => {
          shouldDebounceArticle.current = false;
          shouldDebounceFavicon.current = false;
        }}
      />
      <ArticleData
        article={article}
        setRandomArticle={setRandomArticle}
      />
    </article>
  );
});

function getEndpoint(url: string) {
  return `https://www.redditpublishdate.com/api/get-date?url=${url}`;
  // return `https://www.redditpublishdate.com/api/get-date?cache=false&url=${url}`;
  // return `http://localhost:8000/api/get-date?url=${url}`;
  // return `http://localhost:8000/api/get-date?cache=false&url=${url}`;
}

function getArticleCacheKey(url: URL) {
  return url.hostname + url.pathname;
}

function getFaviconCacheKey(url: URL) {
  return url.hostname.replace('www.', '');
}

export type Article = {
  url: URL;
  isLoading?: boolean;
  favicon?: Nullable<Favicon>;
  data: Nullable<ArticleData>;
};

type ErrorType = 'validation' | 'date-not-found' | 'loading-failed' | 'server';

export type ArticleData = {
  organization?: Nullable<string>;
  title?: Nullable<string>;
  description?: Nullable<string>;
  publishDate?: Nullable<Date | string>;
  modifyDate?: Nullable<Date | string>;
  location?: Nullable<string>;
  html?: Nullable<string>;
  error?: Nullable<string>;
  errorType?: Nullable<ErrorType>;
};

export type Favicon = FaviconResponse & {
  isLoading?: boolean;
};

const initialArticleData: ArticleData = {
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
