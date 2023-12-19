import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  memo,
  type FocusEventHandler,
  type ClipboardEventHandler
} from 'react';
import styles from './PublishDateWidget.module.scss';
import useIsMounted from '@hooks/useIsMounted';
import { TextField, Button } from '@elements';
import classNames from 'classnames';
import type { FaviconResponse } from '@api/favicon';

export default memo(function ArticleTextField({
  value,
  favicon,
  isLoading,
  isValid,
  setUrl,
  setRandomArticle,
  onFocus,
  onBlur,
  onPaste
}: ArticleTextFieldProps) {
  if (!favicon?.url) favicon = defaultIcon;

  const handleChange = useCallback((value: string) => setUrl(value), [setUrl]);

  const validationState = useMemo(() => {
    return {
      value: isValid,
      message: isValid ? '' : 'Please enter a valid URL'
    };
  }, [isValid]);

  return (
    <TextField
      value={value}
      type="url"
      label="News article link"
      placeholder="Paste an article URL"
      wrapperClassName={styles.input}
      icon={<ArticleFavicon icon={favicon} />}
      theme="dark"
      autoComplete="off"
      autoCapitalize="none"
      spellCheck={false}
      validationState={validationState}
      showInlineValidIndicator={false}
      onChange={handleChange}
      onPaste={onPaste}
      onFocus={onFocus}
      onBlur={onBlur}
      controlEl={
        <RandomArticleButton
          isLoading={isLoading}
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
  value: string;
  favicon: Nullable<FaviconResponse>;
  isLoading: boolean;
  isValid: boolean;
  setUrl: (href: string, immediate?: boolean) => void;
  setRandomArticle: () => void;
  onFocus: FocusEventHandler;
  onBlur: FocusEventHandler;
  onPaste: ClipboardEventHandler;
};

type RandomArticleButtonProps = {
  isLoading?: boolean;
  setRandomArticle: () => void;
};
