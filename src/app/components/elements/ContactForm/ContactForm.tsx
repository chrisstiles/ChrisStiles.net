import {
  memo,
  startTransition,
  useState,
  useCallback,
  useId,
  useRef,
  useEffect,
  useMemo,
  type FormEvent
} from 'react';
import styles from './ContactForm.module.scss';
import * as Icon from './icons';
import { TextField, Button, type ValidationState } from '@elements';
import gsap from 'gsap';
import { upperFirst } from 'lodash';
import type { ContactFormRequest, ContactFormResponse } from '@api/contact';

export default memo(function ContactForm() {
  const id = useId();
  const [data, setData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });

  const [isValid, setIsValid] = useState<{
    [key in FormFieldName]: ValidationState;
  }>({
    name: { value: false, message: '' },
    email: { value: false, message: '' },
    message: { value: false, message: '' }
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(isLoading);
  const [apiResponse, setApiResponse] = useState<ApiResponseData | null>(null);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Spam filters
  const honeypot = useRef<HTMLInputElement>(null);
  const timestamp = useRef(new Date());

  const handleChange = useCallback((value: string, name: string) => {
    setData(data => ({ ...data, [name]: value }));

    startTransition(() => {
      setIsValid(isValid => ({
        ...isValid,
        [name]: validateField(name as FormFieldName, value)
      }));
    });
  }, []);

  const canSubmit = useMemo(() => {
    return Object.values(isValid).every(v => v.value);
  }, [isValid]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (apiResponse?.success || apiResponse?.error || isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;
      setIsLoading(true);
      setHasSubmitted(true);

      const formData: ContactFormRequest = {
        ...data,
        timestamp: timestamp.current,
        honeypot: honeypot.current?.value ?? ''
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'post',
          body: JSON.stringify(formData),
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
    apiResponse &&
    !apiResponse.success &&
    (apiResponse.error ?? apiResponse.message);

  const fieldComponents = useMemo(() => {
    return fields.map(({ name, ...field }, index) => (
      <TextField
        key={index}
        name={name}
        value={data[name] ?? ''}
        validationState={isValid[name]}
        error={apiResponse?.validationErrors?.[name]}
        forceShowValidation={hasSubmitted}
        onChange={handleChange}
        required
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
        aria-label="Contact form"
        aria-describedby={hasFormError ? `${id}-form-error` : undefined}
        onSubmit={handleSubmit}
      >
        {hasFormError && (
          <ErrorMessage
            id={`${id}-form-error`}
            message={apiResponse.error ?? apiResponse.message}
          />
        )}
        {fieldComponents}
        <label
          htmlFor={`${id}-honeypot`}
          aria-hidden="true"
          className={styles.honeypot}
        >
          Do not fill this field out if you are a human
          <input
            ref={honeypot}
            id={`${id}-honeypot`}
            type="text"
            name="website"
            tabIndex={-1}
            required
          />
        </label>

        <Button
          type="submit"
          className={styles.submit}
          isLoading={isLoading}
          disabled={
            !canSubmit ||
            isLoading ||
            apiResponse?.success ||
            !!apiResponse?.error
          }
        >
          Send your message
        </Button>
      </form>
      {apiResponse?.success && <SuccessMessage />}
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

export const validations: FieldValidations = {
  name: {
    min: 2,
    max: 100
  },
  email: {
    min: 0,
    max: 200,
    check: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
  },
  message: {
    min: 3,
    max: 600
  }
};

export function validateField(
  name: FormFieldName,
  value: string = ''
): ValidationState {
  if (!validations[name]) {
    return { value: true, message: '' };
  }

  const { min, max, check } = validations[name];
  const val = (value ?? '').trim();
  const len = val.length;
  const word = name === 'message' ? 'a' : 'your';

  if (!val || (name === 'message' && len < min)) {
    return { value: false, message: `Please enter ${word} ${name}` };
  }

  if (len > max) {
    return {
      value: false,
      message: `${upperFirst(name)} is too long (${len}/${max})`
    };
  }

  if (len < min || (check && !check(val))) {
    return { value: false, message: `Please enter a valid ${name}` };
  }

  return { value: true, message: '' };
}

export const defaultErrorMessage =
  'Unable to send your message, please email me directly or try again later.';

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

export type FormFieldName = Extract<keyof ContactFormData, string>;

type Field = {
  name: FormFieldName;
  label: string;
  placeholder: string;
  type?: string;
  icon?: JSX.Element;
};

export type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

export type FieldValidations = {
  [key in FormFieldName]: {
    min: number;
    max: number;
    check?: (v: string) => boolean | string;
  };
};

type ApiResponseData = ContactFormResponse & {
  success: boolean;
};

type ErrorMessageProps = {
  id: string;
  message?: string;
};
