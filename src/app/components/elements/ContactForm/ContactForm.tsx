import {
  memo,
  startTransition,
  useState,
  useCallback,
  useId,
  useRef,
  useEffect,
  useMemo,
  type ReactNode,
  type ChangeEvent,
  type FormEvent
} from 'react';
import styles from './ContactForm.module.scss';
import * as Icon from './icons';
import { Button } from '@elements';
import gsap from 'gsap';
import classNames from 'classnames';
import type { ContactFormResponse } from '@api/contact';

export default function ContactForm() {
  const id = useId();
  const [data, setData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });

  const [isValid, setIsValid] = useState({
    name: false,
    email: false,
    message: false
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(isLoading);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const [apiResponse, setApiResponse] = useState<ApiResponseData | null>(null);

  const handleChange = useCallback(
    (name: keyof ContactFormData, value: string) => {
      setData(data => ({ ...data, [name]: value }));

      startTransition(() => {
        setIsValid(isValid => ({
          ...isValid,
          [name]: validations[name](value.trim())
        }));
      });
    },
    []
  );

  const canSubmit = useMemo(() => {
    return Object.values(isValid).every(v => v);
  }, [isValid]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (apiResponse?.success || isLoadingRef.current) {
        console.log('Not submitting');
        return;
      }

      isLoadingRef.current = true;
      setIsLoading(true);
      setHasSubmitted(true);

      try {
        const res = await fetch('/api/contact', {
          method: 'post',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const body: ContactFormResponse = await res.json();
        setApiResponse({ success: res.ok, ...body });
        setIsLoading(false);
      } catch (error) {
        setApiResponse({
          success: false,
          message: defaultErrorMessage
        });
        setIsLoading(false);
      }
    },
    [data, apiResponse]
  );

  const hasFormError =
    apiResponse && !apiResponse.success && apiResponse.message;

  const fieldComponents = useMemo(() => {
    return fields.map(({ name, ...field }, index) => (
      <Field
        key={index}
        name={name}
        value={data[name]}
        isValid={isValid[name]}
        error={apiResponse?.validationErrors?.[name]}
        hasSubmitted={hasSubmitted}
        onChange={handleChange}
        {...field}
      />
    ));
  }, [data, isValid, apiResponse, hasSubmitted, handleChange]);

  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (apiResponse?.success && form.current) {
      gsap.to(form.current, {
        opacity: 0,
        duration: 0.4,
        onComplete() {
          if (form.current) {
            form.current.style.visibility = 'hidden';
          }
        }
      });
    }
  }, [apiResponse?.success]);

  return (
    <div className={styles.formWrapper}>
      <form
        noValidate
        ref={form}
        aria-describedby={hasFormError ? `${id}-form-error` : undefined}
        onSubmit={handleSubmit}
      >
        {hasFormError && (
          <ErrorMessage
            id={`${id}-form-error`}
            message={apiResponse.message}
          />
        )}
        {fieldComponents}
        <Button
          type="submit"
          className={styles.submit}
          isLoading={isLoading}
          disabled={!canSubmit || isLoading || apiResponse?.success}
        >
          Send your message
        </Button>
      </form>
      {apiResponse?.success && <SuccessMessage />}
    </div>
  );
}

const Field = memo(function Field({
  name,
  value,
  label,
  className,
  type = 'text',
  icon,
  isValid: _isValid,
  error,
  hasSubmitted,
  onChange: handleChange,
  ...restProps
}: FieldProps) {
  const id = useId();
  const [hasBlurred, setHasBlurred] = useState(false);
  const Component = type === 'textarea' ? 'textarea' : 'input';
  const hasServerError = !!error?.trim();
  const isValid = _isValid && !hasServerError;
  const shouldShowInvalid = !isValid && (hasBlurred || hasSubmitted);
  const errorMessage = useMemo(() => {
    const word = name === 'message' ? 'a' : 'your';

    return isValid || (!hasBlurred && !hasSubmitted)
      ? null
      : !value.trim() || type === 'textarea'
      ? error ?? `Please enter ${word} ${name}`
      : error ?? `Please enter a valid ${name}`;
  }, [hasBlurred, hasSubmitted, isValid, error, name, type, value]);

  const props = {
    id: `${id}-input`,
    name,
    value,
    required: true,
    className: classNames(styles.input, className, {
      [styles.hasIcon]: !!icon
    }),
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleChange(name, e.target.value);
    },
    onBlur: () => setHasBlurred(true),
    'aria-invalid': shouldShowInvalid,
    'aria-errormessage':
      shouldShowInvalid && errorMessage ? `${id}-error` : undefined,
    ...restProps
  };

  return (
    <div
      className={classNames(styles.field, {
        [styles.valid]: isValid,
        [styles.invalid]: !isValid,
        [styles.serverError]: !!error,
        [styles.showInvalidIcon]: shouldShowInvalid
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
        {type !== 'textarea' && (
          <div className={styles.validityIcon}>
            {isValid ? <Icon.Valid /> : <Icon.Invalid />}
          </div>
        )}
      </div>
    </div>
  );
});

function ErrorMessage({
  id,
  message = defaultErrorMessage
}: ErrorMessageProps) {
  return (
    <div
      id={id}
      className={styles.formError}
    >
      <Icon.Alert aria-hidden="true" />
      {message}
    </div>
  );
}

function SuccessMessage() {
  return (
    <div className={styles.successWrapper}>
      <svg
        className={styles.checkmark}
        viewBox="0 0 52 52"
      >
        <circle
          cx="26"
          cy="26"
          r="25"
          fill="none"
        />
        <path
          fill="none"
          d="M14.1 27.2l7.1 7.2 16.7-16.8"
        />
      </svg>
      <div className={styles.successText}>
        <strong>Thank you, your submission has been received</strong>
        <p>I will get back to you as quickly as possible</p>
      </div>
    </div>
  );
}

export const validations: ValidationFunctions = {
  name: (v: string) => v.length >= 2,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
  message: (v: string) => v.length >= 3
};

export type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

export type ValidationFunctions = {
  [key in keyof ContactFormData]: (v: string) => boolean;
};

type FieldProps = {
  name: keyof ContactFormData;
  value: string;
  label: string;
  className?: string;
  icon?: ReactNode;
  placeholder?: string;
  type?: string;
  isValid: boolean;
  error?: string;
  hasSubmitted: boolean;
  onChange: (name: keyof ContactFormData, value: string) => void;
};

type Field = {
  name: keyof ContactFormData;
  label: string;
  placeholder: string;
  type?: string;
  icon?: JSX.Element;
};

type ApiResponseData = ContactFormResponse & {
  success: boolean;
};

type ErrorMessageProps = {
  id: string;
  message?: string;
};

export const defaultErrorMessage =
  'Unable to send your message, please try again later';

const fields: Field[] = [
  {
    name: 'name',
    label: 'Your name',
    icon: <Icon.Person />,
    placeholder: 'Enter your name'
  },
  {
    name: 'email',
    label: 'Email address',
    type: 'email',
    icon: <Icon.Email />,
    placeholder: 'Enter your email address'
  },
  {
    name: 'message',
    label: 'Message',
    type: 'textarea',
    placeholder: 'How can I help you?'
  }
];
