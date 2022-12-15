import {
  useState,
  useCallback,
  useEffect,
  useRef,
  memo,
  type ClipboardEventHandler
} from 'react';
import styles from './PublishDateWidget.module.scss';
import useIsMounted from '@hooks/useIsMounted';
import { TextField, Button, type ValidationState } from '@elements';
import { isValidURL } from '@helpers';
import classNames from 'classnames';
import type { Article } from '../PublishDateWidget';
import type { FaviconResponse } from '@api/favicon';

export default memo(function ArticleTextField({
  article,
  favicon,
  setUrl,
  setRandomArticle,
  onPaste
}: ArticleTextFieldProps) {
  if (!favicon?.url) favicon = defaultIcon;

  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState<ValidationState>({
    value: true,
    message: ''
  });

  const validUrlTimer = useRef<number>();
  const checkUrl = useCallback(
    (value: string, shouldUpdateUrl: boolean = true) => {
      if (value) {
        if (!value.startsWith('http') && isValidURL(value)) {
          value = `https://${value}`;
        }

        try {
          const url = new URL(value);
          if (shouldUpdateUrl) setUrl(url);
          setIsValid({ value: true, message: '' });
        } catch {
          if (shouldUpdateUrl) setUrl(null);
          setIsValid({ value: false, message: 'Please enter a valid URL' });
        }
      }
    },
    [setUrl]
  );

  const handleChange = useCallback(
    (value: string) => {
      setInputValue(value);

      value = value.trim();

      if (value) {
        checkUrl(value);
      } else {
        clearTimeout(validUrlTimer.current);
        setUrl(null);
        setIsValid({ value: false, message: '' });
      }
    },
    [checkUrl, setUrl]
  );

  useEffect(() => {
    if (article) {
      setInputValue(article.url.href);
      checkUrl(article.url.href, false);
    }
  }, [article, checkUrl]);

  return (
    <TextField
      value={inputValue}
      type="url"
      label="News article link"
      placeholder="Paste an article URL"
      wrapperClassName={styles.input}
      icon={<ArticleFavicon icon={favicon} />}
      theme="dark"
      autoComplete="off"
      autoCapitalize="off"
      spellCheck={false}
      validationState={isValid}
      showInlineValidIndicator={false}
      onChange={handleChange}
      onPaste={onPaste}
      controlEl={
        <RandomArticleButton
          isLoading={article?.isLoading}
          setRandomArticle={setRandomArticle}
        />
      }
    />
  );
});

function ArticleFavicon({ icon }: { icon: Nullable<FaviconResponse> }) {
  return !icon?.url ? null : (
    <div
      className={classNames(styles.inputFavicon, {
        [styles.default]: icon.url === defaultIcon.url,
        [styles.dark]: icon.isDark
      })}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        src={icon.url}
        width={20}
        height={20}
      />
    </div>
  );
}

function RandomArticleButton({
  isLoading,
  setRandomArticle
}: RandomArticleButtonProps) {
  const [showLoading, setShowLoading] = useState(!!isLoading);
  const loadingTimer = useRef<number>();
  const isMounted = useIsMounted();

  useEffect(() => {
    clearTimeout(loadingTimer.current);

    if (isLoading) {
      loadingTimer.current = window.setTimeout(() => {
        if (isMounted()) setShowLoading(true);
      }, 20);
    } else {
      setShowLoading(false);
    }
  }, [isLoading, isMounted]);

  return (
    <Button
      isLoading={showLoading}
      disabled={showLoading}
      theme="secondary"
      onClick={e => {
        e.preventDefault();
        if (isLoading) return;
        setRandomArticle();
      }}
    >
      Random article
    </Button>
  );
}

const defaultIcon = {
  url: '/images/link.svg',
  isDark: false
};

type ArticleTextFieldProps = {
  setUrl: (url: Nullable<URL>, immediate?: boolean) => void;
  setRandomArticle: () => void;
  article: Nullable<Article>;
  favicon: Nullable<FaviconResponse>;
  onPaste?: ClipboardEventHandler;
};

type RandomArticleButtonProps = {
  isLoading?: boolean;
  setRandomArticle: () => void;
};
