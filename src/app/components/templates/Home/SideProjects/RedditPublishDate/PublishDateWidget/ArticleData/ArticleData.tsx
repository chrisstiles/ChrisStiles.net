import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
  forwardRef
} from 'react';
import styles from './ArticleData.module.scss';
import ArticleMetadata from './ArticleMetadata';
import ArticleDetails from './ArticleDetails';
import ArticleCode from './ArticleCode';
import { Button } from '@elements';
import { isSameUrl } from '@helpers';
import classNames from 'classnames';
import gsap from 'gsap';
import BezierEasing from 'bezier-easing';
import type { Article } from '../PublishDateWidget';

export default memo(function ArticleData({
  article: currentArticle,
  className,
  setRandomArticle
}: ArticleDataWrapperProps) {
  const prevArticle = useRef<Nullable<Article>>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const placeholder = useRef<HTMLDivElement>(null);
  const contentWrapper = useRef<HTMLDivElement>(null);
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
  const [hasFirstArticle, setHasFirstArticle] = useState(false);
  const [firstAnimationComplete, setFirstAnimationComplete] = useState(false);
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
      const placeholderEl = placeholder.current;
      const contentWrapperEl = contentWrapper.current;
      const cloneEl = clone.current;
      const contentEl = content.current;

      if (!isFirst) {
        const codeEl = contentEl?.querySelector('pre');
        const cloneCodeEl = cloneEl?.querySelector('pre');

        if (codeEl && cloneCodeEl) {
          cloneCodeEl.scrollTo(codeEl.scrollLeft, codeEl.scrollTop);
        }
      }

      if (!animation.current) {
        gsap.set(wrapperEl, { height: prevHeight });
        gsap.set(cloneEl, { opacity: 1 });
        gsap.set(contentEl, { opacity: 0 });
      }

      wrapperEl?.classList.add(styles.animating);

      requestAnimationFrame(() => {
        animation.current ??= gsap.timeline({
          onComplete() {
            animation.current = null;
            setFirstAnimationComplete(true);
            setCloneArticle(article);

            setTimeout(() => {
              if (wrapper.current) {
                wrapper.current.style.height = '';
                wrapper.current.classList.remove(styles.animating);
              }
              if (clone.current) clone.current.style.opacity = '';
            }, 0);
          }
        });

        const duration = !isFirst ? 0.3 : 0.7;
        const ease = !isFirst
          ? BezierEasing(0.25, 0.1, 0.25, 1)
          : BezierEasing(0.56, 0, 0.06, 1);

        animation.current.to(contentWrapperEl, { opacity: 1, duration: 0 });

        animation.current.to(wrapperEl, {
          height,
          duration,
          ease
        });

        if (hasAnimated.current) {
          const fadeOut = { opacity: 0, duration: 0.22 };
          animation.current.to(cloneEl, fadeOut, '<');
        } else {
          const fadeOut = { opacity: 0, duration: 0.45 };
          animation.current.to(placeholderEl, fadeOut, '<+0.1');
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
      !contentWrapper.current ||
      !isNewArticle ||
      !hasFirstArticle
    ) {
      return;
    }

    const prevHeight = wrapperHeight.current;
    const height = contentWrapper.current.offsetHeight ?? 0;

    if (height !== wrapperHeight.current) {
      wrapperHeight.current = height;
      updateWrapperHeight(height, prevHeight, currentArticle);
    } else {
      setFirstAnimationComplete(true);
    }

    prevArticle.current = currentArticle;
  }, [currentArticle, isNewArticle, hasFirstArticle, updateWrapperHeight]);

  useEffect(() => {
    if (!hasFirstArticle && currentArticle && !currentArticle?.isLoading) {
      setHasFirstArticle(true);
    }
  }, [currentArticle, hasFirstArticle]);

  useEffect(() => {
    if (
      currentArticle &&
      prevArticle.current &&
      isSameUrl(currentArticle, prevArticle.current)
    ) {
      prevArticle.current.favicon = currentArticle.favicon;
    }
  }, [currentArticle]);

  useMemo(() => {
    if (
      article &&
      wrapper.current &&
      !article.isLoading &&
      !hasAnimated.current
    ) {
      wrapperHeight.current = wrapper.current.offsetHeight;
      gsap.set(wrapper.current, { height: wrapperHeight.current });
    }
  }, [article]);

  return (
    <div
      ref={wrapper}
      className={classNames(styles.wrapper, className, {
        [styles.loading]: currentArticle?.isLoading,
        [styles.hasArticle]: firstAnimationComplete
      })}
    >
      <ArticlePlaceholder
        ref={placeholder}
        isLoading={article?.isLoading}
        setRandomArticle={setRandomArticle}
      />
      <div
        ref={contentWrapper}
        className={styles.contentWrapper}
        aria-hidden={!firstAnimationComplete}
      >
        <div
          ref={content}
          className={styles.data}
        >
          <ArticleContent
            article={article}
            isEntering={!hasFirstArticle}
          />
        </div>
        <div
          className={styles.clone}
          ref={clone}
        >
          {hasFirstArticle && (
            <ArticleContent
              article={cloneArticle}
              isClone
            />
          )}
        </div>
      </div>
    </div>
  );
});

const ArticlePlaceholder = forwardRef<HTMLDivElement, ArticlePlaceholderProps>(
  function ArticlePlaceholder({ isLoading, setRandomArticle }, ref) {
    const [showLoading, setShowLoading] = useState(!!isLoading);

    useEffect(() => {
      if (isLoading) setShowLoading(true);
    }, [isLoading]);

    return (
      <div
        ref={ref}
        className={styles.placeholder}
      >
        <p>
          The API will parse the article and attempt to determine when it was
          first published, and when it was last&dbsp;modified.
        </p>
        <Button
          isLoading={showLoading}
          disabled={showLoading}
          onClick={() => {
            setShowLoading(true);
            if (isLoading) return;
            setRandomArticle();
          }}
        >
          Choose an article for me
        </Button>
      </div>
    );
  }
);

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

type ArticleDataWrapperProps = ArticleDataProps & {
  className?: string;
  setRandomArticle: () => void;
};

type ArticleContentProps = ArticleDataProps & {
  isEntering?: boolean;
  isLeaving?: boolean;
  isClone?: boolean;
};

type ArticlePlaceholderProps = {
  isLoading?: boolean;
  setRandomArticle: () => void;
};
