import {
  useState,
  useCallback,
  useRef,
  memo,
  type ClipboardEventHandler
} from 'react';
import styles from './PublishDateWidget.module.scss';
import { TextField, type ValidationState } from '@elements';
import { isValidURL } from '@helpers';
import classNames from 'classnames';
import type { FaviconResponse } from '@api/favicon';

export default memo(function ArticleTextField({
  setUrl,
  favicon,
  onPaste
}: ArticleTextFieldProps) {
  favicon ||= defaultIcon;

  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState<ValidationState>({
    value: false,
    message: ''
  });

  const validUrlTimer = useRef<number>();
  const checkUrl = useCallback(
    (value: string) => {
      if (value) {
        if (!value.startsWith('http') && isValidURL(value)) {
          value = `https://${value}`;
        }

        try {
          setUrl(new URL(value));
          setIsValid({ value: true, message: '' });
        } catch {
          setUrl(null);
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

  const currentValue = isFocused
    ? inputValue
    : inputValue.replace(/^(https?:\/\/)?(www\.)?/, '');

  return (
    <TextField
      value={currentValue}
      type="url"
      label="News article"
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
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
});

function ArticleFavicon({ icon }: { icon: FaviconResponse }) {
  return (
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
        width={24}
        height={24}
      />
    </div>
  );
}

const defaultIcon = {
  url: '/images/link.svg',
  isDark: false
};

type ArticleTextFieldProps = {
  setUrl: (url: Nullable<URL>) => void;
  favicon: Nullable<FaviconResponse>;
  onPaste?: ClipboardEventHandler;
};
