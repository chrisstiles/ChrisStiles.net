import styles from './ArticleData.module.scss';
import { preventOrphanedWord } from '@helpers';
import classNames from 'classnames';
import type { ArticleDataProps } from './ArticleData';

export default function ArticleMetadata({
  article,
  favicon
}: ArticleDataProps) {
  if (!article?.data) return null;
  const { url, data } = article;
  const headline = data.title ?? data.organization ?? url.hostname;
  const subheadline = data.description ?? url.href;

  return (
    <a
      href={url.href}
      className={styles.metadata}
    >
      {favicon?.url && (
        <div
          className={classNames(styles.favicon, {
            [styles.dark]: favicon.isDark
          })}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            src={favicon.url}
            width={24}
            height={24}
          />
        </div>
      )}
      <div className={styles.text}>
        {(headline || subheadline) && (
          <div>
            {headline && <h3>{preventOrphanedWord(headline)}</h3>}
            {subheadline && headline !== url.hostname && <p>{subheadline}</p>}
          </div>
        )}
      </div>
    </a>
  );
}
