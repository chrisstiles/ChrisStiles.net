import { useState, useCallback, useRef } from 'react';
import styles from './PublishDateWidget.module.scss';
import { TextField, type ValidationState } from '@elements';
import { isValidURL } from '@helpers';
import classNames from 'classnames';

const defaultIcon = '/images/link.svg';

export default function ArticleTextField({
  setUrl,
  favicon
}: ArticleTextFieldProps) {
  favicon ||= defaultIcon;

  const [inputValue, setInputValue] = useState('');
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

  return (
    <TextField
      value={inputValue}
      label="Article"
      placeholder="Enter an article URL"
      wrapperClassName={styles.input}
      icon={<ArticleFavicon src={favicon} />}
      validationState={isValid}
      showInlineValidIndicator={false}
      onChange={handleChange}
    />
  );
}

function ArticleFavicon({ src }: { src: string }) {
  return (
    <div
      className={classNames(styles.inputFavicon, {
        [styles.default]: src === defaultIcon
      })}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        src={src}
        width={24}
        height={24}
      />
    </div>
  );
}

type ArticleTextFieldProps = {
  setUrl: (url: Nullable<URL>) => void;
  favicon: Nullable<string>;
};
