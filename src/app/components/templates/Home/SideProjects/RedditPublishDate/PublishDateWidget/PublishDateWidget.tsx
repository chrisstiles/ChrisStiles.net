import { useState, useRef, useCallback, memo } from 'react';
import styles from './PublishDateWidget.module.scss';
import ArticleTextField from './ArticleTextField';
import ArticleData from './ArticleData';
import useVariableRef from '@hooks/useVariableRef';
import useIsMounted from '@hooks/useIsMounted';
import { H3 } from '@elements';
import type { FaviconResponse } from '@api/favicon';

// TODO: Check when article visible => clear text => add another
// TODO: Make widget accessible
// TODO: Add checks to limit cache size
// TODO: Add handling for both success/failure when searching root URLs

export default memo(function PublishDateWidget() {
  const isMounted = useIsMounted();

  const [article, _setArticle] = useState<Nullable<Article>>(null);
  const articleRef = useVariableRef(article);
  const cachedArticles = useRef<{ [key: string]: Article }>({});
  const shouldDebounceArticle = useRef(true);
  const articleTimer = useRef<number>();

  const [favicon, _setFavicon] = useState<Nullable<Favicon>>(null);
  const cachedFavicons = useRef<{ [key: string]: Nullable<Favicon> }>({});
  const shouldDebounceFavicon = useRef(true);
  const faviconTimer = useRef<number>();

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

      const faviconCacheKey = getFaviconCacheKey(article.url);
      const favicon = cachedFavicons.current.hasOwnProperty(faviconCacheKey)
        ? cachedFavicons.current[faviconCacheKey]
        : { isLoading: true, url: '' };

      article = {
        favicon,
        ...article
      };

      if (shouldUpdateState) _setArticle(article);
      cachedArticles.current[getArticleCacheKey(article.url)] = article;
    },
    [articleRef, isMounted]
  );

  const setFavicon = useCallback(
    async (url: Nullable<URL>) => {
      clearTimeout(faviconTimer.current);

      // Althout techincally valid URLs, we do not attempt to fetch
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
        if (forceUpdate || articleRef.current?.url.href === url.href) {
          _setFavicon(favicon);
        }

        cachedFavicons.current[faviconCacheKey] = favicon;

        if (cachedArticles.current[articleCacheKey]) {
          const article = {
            ...cachedArticles.current[articleCacheKey],
            favicon
          };

          cachedArticles.current[articleCacheKey] = article;
          setArticle(article);
        }
      };

      if (cachedFavicons.current.hasOwnProperty(faviconCacheKey)) {
        updateFavicon(cachedFavicons.current[faviconCacheKey], true);
      } else {
        const fetchFavicon = async () => {
          updateFavicon({ isLoading: true, url: '' });

          try {
            const apiUrl = `/api/favicon?url=${url.hostname}`;
            const res = await fetch(apiUrl);
            let favicon = await res.json();
            if (!favicon?.url) favicon = null;

            updateFavicon(favicon);
          } catch {
            if (
              !articleRef.current ||
              articleRef.current.url.href === url.href
            ) {
              updateFavicon(null);
              return;
            }
          }
        };

        if (!shouldDebounceFavicon.current) {
          fetchFavicon();
        } else {
          faviconTimer.current = window.setTimeout(fetchFavicon, 100);
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
    (url: Nullable<URL>) => {
      if (!url) {
        setArticle(null);
        setFavicon(null);
        return;
      }

      if (url.href === articleRef.current?.url.href) return;

      const cachedArticle = cachedArticles.current[getArticleCacheKey(url)];

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
        onPaste={() => {
          shouldDebounceArticle.current = false;
          shouldDebounceFavicon.current = false;
        }}
      />
      <ArticleData article={article} />
    </article>
  );
});

function getEndpoint(url: string) {
  // return `http://localhost:8000/api/get-date?url=${url}&mode=fetch`;
  return `https://www.redditpublishdate.com/api/get-date?url=${url}`;
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
