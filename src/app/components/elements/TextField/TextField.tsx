import {
  memo,
  useState,
  useEffect,
  useMemo,
  useId,
  type ReactNode,
  type ChangeEvent
} from 'react';
import styles from './TextField.module.scss';
import * as Icon from './icons';
import classNames from 'classnames';

export default memo(function TextField({
  name = '',
  value,
  label,
  className,
  type = 'text',
  required,
  showInlineValidIndicator = true,
  autoComplete,
  icon,
  validationState,
  error,
  forceShowValidation = false,
  onChange: handleChange,
  ...restProps
}: FieldProps) {
  const id = useId();
  const [hasBlurred, setHasBlurred] = useState(false);
  const [hasInput, setHasInput] = useState(false);
  const Component = type === 'textarea' ? 'textarea' : 'input';
  const hasServerError = !!error?.trim();
  const isValid = validationState.value && !hasServerError;
  const hasInteracted = hasBlurred && hasInput;
  const shouldShowInvalid =
    !isValid &&
    ((hasInteracted && (required || !!value.trim())) || forceShowValidation);
  const errorMessage = useMemo(() => {
    return isValid || ((!hasBlurred || !hasInput) && !forceShowValidation)
      ? null
      : error ?? validationState.message;
  }, [
    isValid,
    hasBlurred,
    hasInput,
    forceShowValidation,
    error,
    validationState
  ]);

  const props = {
    id: `${id}-input`,
    name,
    value,
    autoComplete,
    required,
    className: classNames(styles.input, className, {
      [styles.hasIcon]: !!icon
    }),
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleChange(e.target.value, name);
    },
    onBlur: () => {
      handleChange(value, name);

      if (hasInput) {
        setHasBlurred(true);
      }
    },
    'aria-invalid': shouldShowInvalid,
    'aria-errormessage':
      shouldShowInvalid && errorMessage ? `${id}-error` : undefined,
    ...restProps
  };

  useEffect(() => {
    if (!!value) {
      setHasInput(true);
    }
  }, [value]);

  return (
    <div
      className={classNames(styles.field, {
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
        <Component {...props} />
        {icon && (
          <div
            className={styles.icon}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        {showInlineValidIndicator && type !== 'textarea' && (
          <div className={styles.validityIcon}>
            {isValid ? <Icon.Valid /> : <Icon.Invalid />}
          </div>
        )}
      </div>
    </div>
  );
});

export type FieldProps = {
  name?: string;
  value: string;
  label: string;
  required?: boolean;
  showInlineValidIndicator?: boolean;
  className?: string;
  icon?: ReactNode;
  placeholder?: string;
  autoComplete?: string;
  type?: string;
  validationState: ValidationState;
  error?: string;
  forceShowValidation?: boolean;
  onChange: ((value: string, name: string) => void) | ((value: string) => void);
};

export type ValidationState = {
  value: boolean;
  message: string;
};
