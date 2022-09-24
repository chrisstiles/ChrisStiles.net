import { useState, useRef, useCallback } from 'react';
import styles from './PublishDateWidget.module.scss';
import ArticleTextField from './ArticleTextField';
import useVariableRef from '@hooks/useVariableRef';
import { H3 } from '@elements';

// TODO: Make widget accessible
// TODO: Add checks to limit cache size

export default function PublishDateWidget() {
  const [article, setArticle] = useState<Nullable<Article>>(null);
  const articleRef = useVariableRef(article);
  const cachedArticles = useRef<{ [key: string]: Article }>({});

  const [favicon, _setFavicon] = useState<Nullable<string>>(null);
  const cachedFavicons = useRef<{ [key: string]: string }>({});
  const fetchFaviconTimer = useRef<number>();

  const setFavicon = useCallback(
    async (url: Nullable<URL>) => {
      // Althout techincally valid URLs, we do not attempt to fetch
      // favicons for URLs like "www.mydomain" while the user types
      if (!url || url.hostname.match(/www\.[^.]*$/)) {
        _setFavicon(null);
        return;
      }

      const cacheKey = url.hostname;

      if (cachedFavicons.current.hasOwnProperty(cacheKey)) {
        _setFavicon(cachedFavicons.current[cacheKey]);
      } else {
        clearTimeout(fetchFaviconTimer.current);

        fetchFaviconTimer.current = window.setTimeout(async () => {
          try {
            const apiUrl = `/api/favicon?url=${url.hostname}`;
            const res = await fetch(apiUrl);
            const favicon = await res.text();

            if (articleRef.current?.url === url.href) {
              _setFavicon(favicon);
            }

            cachedFavicons.current[cacheKey] = favicon;
          } catch {
            if (!articleRef.current || articleRef.current.url === url.href) {
              _setFavicon(null);
              return;
            }
          }
        }, 200);
      }
    },
    [articleRef]
  );

  const setUrl = useCallback(
    (url: Nullable<URL>) => {
      if (!url) {
        setArticle(null);
        setFavicon(null);
        return;
      }

      if (url.href === articleRef.current?.url) return;

      // We ignore URL parameters and protocols when caching articles
      const cacheKey = url.hostname + url.pathname;
      const article = cachedArticles.current[cacheKey] ?? {
        url: url.href,
        isLoading: true
      };

      setArticle(article);
      setFavicon(url);
    },
    [articleRef, setFavicon]
  );

  return (
    <article className={styles.wrapper}>
      <H3 eyebrow="Publish date service">Try out my publish date API</H3>
      <ArticleTextField
        setUrl={setUrl}
        favicon={favicon}
      />
    </article>
  );
}

type Article = {
  url: string;
  title?: string;
  description?: string;
  publishDate?: Date | null;
  isLoading: boolean;
};
