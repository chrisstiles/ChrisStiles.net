import { useState, useEffect, useRef } from 'react';
import styles from './PublishDateWidget.module.scss';
import ArticleTextField from './ArticleTextField';
import { H3 } from '@elements';

// TODO: Make widget accessible

export default function PublishDateWidget() {
  const [url, setUrl] = useState<Nullable<URL>>(null);
  const [data, setData] = useState<Nullable<DomainData>>(null);
  const cache = useRef<Domains>({});

  useEffect(() => {
    if (url) {
      if (cache.current[url.hostname]) {
        setData(cache.current[url.hostname]);
      } else {
        setData({
          hostname: url.hostname,
          articles: []
        });
      }
    }
  }, [url]);

  return (
    <article className={styles.wrapper}>
      <H3 eyebrow="Publish date service">Try out my publish date API</H3>
      <ArticleTextField setUrl={setUrl} />
    </article>
  );
}

type Domains = {
  [key: string]: DomainData;
};

type DomainData = {
  hostname: string;
  faviconUrl?: string;
  articles: ArticleData[];
};

type ArticleData = {
  url: string;
  title?: string;
  description?: string;
  publishDate?: string | null;
};
