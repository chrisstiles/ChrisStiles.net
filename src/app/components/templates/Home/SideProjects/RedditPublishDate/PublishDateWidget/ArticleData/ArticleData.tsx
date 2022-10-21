import { useState, useRef, useEffect, useCallback, memo } from 'react';
import styles from './ArticleData.module.scss';
import ArticleMetadata from './ArticleMetadata';
import ArticleDetails from './ArticleDetails';
import ArticleCode from './ArticleCode';
import { isSameUrl } from '@helpers';
import classNames from 'classnames';
import gsap from 'gsap';
import BezierEasing from 'bezier-easing';
import type { Article } from '../PublishDateWidget';

export default memo(function ArticleData({
  article: currentArticle,
  className
}: ArticleDataProps & { className?: string }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const prevArticle = useRef<Nullable<Article>>(null);
  const content = useRef<HTMLDivElement>(null);
  const clone = useRef<HTMLDivElement>(null);

  // Continue showing previous article while new one is loading
  const article =
    currentArticle && (!currentArticle.isLoading || !prevArticle.current)
      ? currentArticle
      : prevArticle.current;

  const isNewArticle =
    !!currentArticle &&
    !currentArticle.isLoading &&
    !isSameUrl(currentArticle, prevArticle.current);

  const wrapperHeight = useRef(0);
  const [hasInitialArticle, setHasInitialArticle] = useState(false);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const hasAnimated = useRef(false);
  const [cloneArticle, setCloneArticle] = useState(currentArticle);

  const updateWrapperHeight = useCallback(
    (height: number, prevHeight: number, article: Nullable<Article>) => {
      if (hasAnimated.current) {
        setCloneArticle(prevArticle.current);
      }

      const isFirst = !hasAnimated.current;
      const wrapperEl = wrapper.current;
      const cloneEl = clone.current;
      const contentEl = content.current;

      if (!animation.current) {
        gsap.set(wrapperEl, { height: prevHeight, visibility: 'visible' });
        gsap.set(cloneEl, { opacity: 1 });
        gsap.set(contentEl, { opacity: 0 });
      }

      requestAnimationFrame(() => {
        animation.current ??= gsap.timeline({
          onComplete() {
            animation.current = null;
            if (wrapper.current) wrapper.current.style.height = '';
            if (clone.current) clone.current.style.opacity = '';
            setCloneArticle(article);
          }
        });

        const duration = !isFirst ? 0.3 : 0.7;
        const ease = !isFirst
          ? BezierEasing(0.25, 0.1, 0.25, 1)
          : BezierEasing(0.56, 0, 0.06, 1);

        animation.current.to(wrapperEl, { height, duration, ease });

        if (hasAnimated.current) {
          const fadeOut = { opacity: 0, duration: 0.22 };
          animation.current.to(cloneEl, fadeOut, '<');
        }

        const fadeIn = { opacity: 1, duration: isFirst ? 0.35 : 0.22 };
        animation.current.to(contentEl, fadeIn, isFirst ? '>-0.1' : '>+0.2');
        hasAnimated.current = true;
      });
    },
    []
  );

  useEffect(() => {
    if (
      animation.current ||
      !wrapper.current ||
      !isNewArticle ||
      !hasInitialArticle
    ) {
      return;
    }

    const prevHeight = wrapperHeight.current;
    const height = wrapper.current.offsetHeight ?? 0;

    if (height !== wrapperHeight.current) {
      wrapperHeight.current = height;
      updateWrapperHeight(height, prevHeight, currentArticle);
    }

    prevArticle.current = currentArticle;
  }, [currentArticle, isNewArticle, hasInitialArticle, updateWrapperHeight]);

  useEffect(() => {
    if (!hasInitialArticle && currentArticle && !currentArticle?.isLoading) {
      setHasInitialArticle(true);
    }
  }, [currentArticle, hasInitialArticle]);

  useEffect(() => {
    if (
      currentArticle &&
      prevArticle.current &&
      isSameUrl(currentArticle, prevArticle.current)
    ) {
      prevArticle.current.favicon = currentArticle.favicon;
    }
  }, [currentArticle]);

  const noDateFound =
    article && !article.isLoading && !article.data?.publishDate;

  return (
    <div
      ref={wrapper}
      className={classNames(styles.wrapper, className, {
        [styles.loading]: currentArticle?.isLoading
      })}
    >
      <div className={styles.contentWrapper}>
        <div
          ref={content}
          className={styles.data}
        >
          <ArticleContent
            article={article}
            isEntering={!hasInitialArticle}
          />
        </div>
        <div
          className={styles.clone}
          ref={clone}
        >
          {hasInitialArticle && (
            <ArticleContent
              article={cloneArticle}
              isClone
            />
          )}
        </div>
        {noDateFound && <h2>No date found :(</h2>}
      </div>
    </div>
  );
});

const ArticleContent = memo(function ArticleContent({
  article,
  isEntering,
  isClone
}: ArticleContentProps) {
  return !article ? null : (
    <div
      aria-hidden={isClone}
      className={classNames(styles.content, {
        [styles.entering]: isEntering,
        [styles.hidden]: !article.data
      })}
    >
      <ArticleMetadata article={article} />
      <ArticleDetails article={article} />
      <ArticleCode article={article} />
    </div>
  );
});

export type ArticleDataProps = {
  article: Nullable<Article>;
};

type ArticleContentProps = ArticleDataProps & {
  isEntering?: boolean;
  isLeaving?: boolean;
  isClone?: boolean;
};
