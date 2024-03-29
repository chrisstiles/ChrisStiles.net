import {
  memo,
  useState,
  useMemo,
  useRef,
  useId,
  type ReactNode,
  type ChangeEvent,
  type FocusEvent,
  type FocusEventHandler,
  type ClipboardEventHandler,
  type UIEvent,
  type UIEventHandler
} from 'react';
import styles from './TextField.module.scss';
import * as Icon from './icons';
import classNames from 'classnames';

export default memo(function TextField({
  name = '',
  value,
  label,
  className,
  wrapperClassName,
  theme,
  type = 'text',
  required,
  showInlineValidIndicator = true,
  icon,
  controlEl,
  validationState,
  error,
  forceShowValidation = false,
  onChange: handleChange,
  onBlur: handleBlur,
  onScroll: handleScroll,
  ...restProps
}: FieldProps) {
  const id = useId();
  const [hasBlurred, setHasBlurred] = useState(false);
  const hasInput = useRef(false);

  if (value && !hasInput.current) {
    hasInput.current = true;
  }

  const isTextArea = type === 'textarea';
  const Component = isTextArea ? 'textarea' : 'input';
  const hasServerError = !!error?.trim();
  const isValid = validationState.value && !hasServerError;
  const hasInteracted = hasBlurred && hasInput.current;
  const [showEllipsis, setShowEllipsis] = useState(!isTextArea);
  const shouldShowInvalid =
    !isValid &&
    ((hasInteracted && (required || !!value.trim())) || forceShowValidation);

  const errorMessage = useMemo(() => {
    return isValid ||
      ((!hasBlurred || !hasInput.current) && !forceShowValidation)
      ? null
      : error ?? validationState.message;
  }, [isValid, hasBlurred, forceShowValidation, error, validationState]);

  const props = {
    id: `${id}-input`,
    name,
    value,
    required,
    type: isTextArea ? undefined : type,
    className: classNames(styles.input, className, {
      [styles.hasIcon]: !!icon,
      [styles.hideEllipsis]: !showEllipsis
    }),
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleChange(e.target.value, name);
    },
    onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // Hacky way to avoid React error when blur is triggered
      // by the same action that closes the contact modal
      setTimeout(() => {
        if (hasInput.current) setHasBlurred(true);
      }, 0);

      handleBlur?.(e);
    },
    onScroll: (e: UIEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!isTextArea) {
        const target = e.target as HTMLInputElement;
        setShowEllipsis(target.scrollLeft <= 0);
      }

      handleScroll?.(e);
    },
    'aria-invalid': shouldShowInvalid,
    'aria-errormessage':
      shouldShowInvalid && errorMessage ? `${id}-error` : undefined,
    ...restProps
  };

  return (
    <div
      className={classNames(styles.field, wrapperClassName, {
        [styles.dark]: theme === 'dark',
        [styles.valid]: isValid && showInlineValidIndicator,
        [styles.invalid]: !isValid,
        [styles.serverError]: !!error,
        [styles.showInvalidIcon]: shouldShowInvalid && showInlineValidIndicator
      })}
    >
      {label && (
        <div className={styles.labelWrapper}>
          <label
            htmlFor={`${id}-input`}
            className={styles.label}
          >
            {label}
          </label>
          {!!errorMessage && (
            <span
              id={`${id}-error`}
              className={styles.fieldError}
            >
              {errorMessage}
            </span>
          )}
        </div>
      )}
      <div className={styles.inputWrapper}>
        <div className={styles.inputContent}>
          <Component {...props} />
          {icon && (
            <div
              className={styles.icon}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          {showInlineValidIndicator && !isTextArea && (
            <div className={styles.validityIcon}>
              {isValid ? <Icon.Valid /> : <Icon.Invalid />}
            </div>
          )}
        </div>
        {controlEl}
      </div>
    </div>
  );
});

export type FieldProps = {
  name?: string;
  value: string;
  label?: string;
  required?: boolean;
  showInlineValidIndicator?: boolean;
  className?: string;
  wrapperClassName?: string;
  icon?: Nullable<ReactNode>;
  controlEl?: Nullable<ReactNode>;
  theme?: 'light' | 'dark';
  placeholder?: string;
  autoComplete?: string;
  autoCorrect?: 'on' | 'off';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  spellCheck?: Booleanish;
  type?: string;
  validationState: ValidationState;
  error?: string;
  forceShowValidation?: boolean;
  onChange: ((value: string, name: string) => void) | ((value: string) => void);
  onFocus?: FocusEventHandler;
  onBlur?: FocusEventHandler;
  onPaste?: ClipboardEventHandler;
  onScroll?: UIEventHandler<HTMLInputElement | HTMLTextAreaElement>;
};

export type ValidationState = {
  value: boolean;
  message: string;
};
