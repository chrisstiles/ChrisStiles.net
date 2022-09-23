import { useState, useCallback, useEffect, useRef, type Dispatch } from 'react';
import { H3, TextField, type ValidationState } from '@elements';
import { isValidURL } from '@helpers';

export default function ArticleTextField({ setUrl }: ArticleTextFieldProps) {
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState<ValidationState>({
    value: false,
    message: ''
  });

  const validUrlTimer = useRef<number>();
  const checkUrl = useCallback(
    (value: string) => {
      clearTimeout(validUrlTimer.current);

      validUrlTimer.current = window.setTimeout(() => {
        if (value) {
          if (!value.startsWith('http') && isValidURL(value)) {
            value = `https://${value}`;
          }

          try {
            const url = new URL(value);
            setUrl(url);
            setIsValid({ value: true, message: '' });
          } catch {
            setUrl(null);
            setIsValid({ value: false, message: 'Please enter a valid URL' });
          }
        }
      }, 50);
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
    <>
      <TextField
        value={inputValue}
        label="Article"
        placeholder="Enter an article URL"
        icon={
          <img src="https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.washingtonpost.com&size=64" />
        }
        validationState={isValid}
        showInlineValidIndicator={false}
        onChange={handleChange}
      />
    </>
  );
}

type ArticleTextFieldProps = {
  setUrl: Dispatch<Nullable<URL>>;
};
