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
  const isFocused = useRef(false);
  const [isValid, setIsValid] = useState<ValidationState>({
    value: true,
    message: ''
  });

  const checkUrl = useCallback(
    (value: string, shouldUpdateUrl: boolean = true) => {
      if (value) {
        const handleInvalidUrl = () => {
          setIsValid({ value: false, message: 'Please enter a valid URL' });
          if (shouldUpdateUrl) setUrl(null);
        };

        // URL constructor will allow certain URLs that the API
        // considers invalid. For example: 'https://www.chrisstiles.'
        // would trigger an exception from the URL constructor
        if (
          value.endsWith('.') ||
          /^(https?:\/\/)?((www\.[^.]+)|([^.]+))\.?$/.test(value)
        ) {
          handleInvalidUrl();
          return;
        }

        if (!value.startsWith('http') && isValidURL(value)) {
          value = `https://${value}`;
        }

        try {
          const url = new URL(value);

          if (url.hostname.endsWith('.')) {
            handleInvalidUrl();
            return;
          }

          setIsValid({ value: true, message: '' });
          if (shouldUpdateUrl) setUrl(url);
        } catch {
          handleInvalidUrl();
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
        setUrl(null);
        setIsValid({ value: false, message: '' });
      }
    },
    [checkUrl, setUrl]
  );

  useEffect(() => {
    if (article) {
      if (!isFocused.current) setInputValue(article.url.href);
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
      autoCapitalize="none"
      spellCheck={false}
      validationState={isValid}
      showInlineValidIndicator={false}
      onChange={handleChange}
      onPaste={onPaste}
      onFocus={() => (isFocused.current = true)}
      onBlur={() => {
        isFocused.current = false;
        if (article) setInputValue(article.url.href);
      }}
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
  const loadingStartTimer = useRef<number>();
  const loadingEndTimer = useRef<number>();
  const loadingStart = useRef<Nullable<Date>>(null);
  const isMounted = useIsMounted();
  const hasLoaded = useRef(false);

  useEffect(() => {
    clearTimeout(loadingStartTimer.current);
    clearTimeout(loadingEndTimer.current);

    // Prevent quick flashes when loading finishes
    // very quickly by slightly delaying when the
    // spinner appears, and forcing a minimum
    // amount of time the spinner is visible
    if (isLoading) {
      if (!hasLoaded.current) {
        hasLoaded.current = true;
        loadingStart.current = new Date();
        setShowLoading(true);
      } else {
        loadingStartTimer.current = window.setTimeout(() => {
          if (isMounted()) {
            loadingStart.current = new Date();
            setShowLoading(true);
          }
        }, 30);
      }
    } else {
      const minTime = 300;
      const start = loadingStart.current?.getTime();
      const end = new Date().getTime();

      if (start && end - start < minTime) {
        loadingEndTimer.current = window.setTimeout(() => {
          if (isMounted()) setShowLoading(false);
        }, minTime - (end - start));
      } else {
        setShowLoading(false);
      }

      loadingStart.current = null;
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
