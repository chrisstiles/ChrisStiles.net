import {
  memo,
  startTransition,
  useState,
  useCallback,
  useId,
  useMemo,
  type ReactNode,
  type ChangeEvent
} from 'react';
import styles from './ContactForm.module.scss';
import * as Icon from './icons';
import { Button } from '@elements';
import classNames from 'classnames';

export default function ContactForm() {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [data, setData] = useState<FormState>({
    name: '',
    email: '',
    message: ''
  });

  const [isValid, setIsValid] = useState({
    name: false,
    email: false,
    message: false
  });

  const canSubmit = useMemo(() => {
    return Object.values(isValid).every(v => v);
  }, [isValid]);

  const handleChange = useCallback((name: keyof FormState, value: string) => {
    setData(data => ({ ...data, [name]: value }));

    startTransition(() => {
      setIsValid(isValid => ({
        ...isValid,
        [name]: validations[name](value.trim())
      }));
    });
  }, []);

  return (
    <form
      noValidate
      onSubmit={e => {
        e.preventDefault();
        setHasSubmitted(true);

        if (canSubmit) {
          console.log('SUBMIT FORM');
        }
      }}
    >
      <Field
        name="name"
        value={data.name}
        label="Your name"
        icon={<Icon.Person />}
        placeholder="Enter your name"
        isValid={isValid.name}
        hasSubmitted={hasSubmitted}
        onChange={handleChange}
      />
      <Field
        name="email"
        value={data.email}
        type="email"
        label="Email address"
        icon={<Icon.Email />}
        placeholder="Enter your email address"
        isValid={isValid.email}
        hasSubmitted={hasSubmitted}
        onChange={handleChange}
      />
      <Field
        name="message"
        value={data.message}
        label="Message"
        type="textarea"
        placeholder="How can I help you?"
        isValid={isValid.message}
        hasSubmitted={hasSubmitted}
        onChange={handleChange}
      />
      <Button
        type="submit"
        className={styles.submit}
        disabled={!canSubmit}
      >
        Send your message
      </Button>
    </form>
  );
}

const Field = memo(function Field({
  name,
  value,
  label,
  className,
  type = 'text',
  icon,
  isValid,
  hasSubmitted,
  onChange: handleChange,
  ...restProps
}: FieldProps) {
  const id = useId();
  const [hasBlurred, setHasBlurred] = useState(false);
  const Component = type === 'textarea' ? 'textarea' : 'input';
  const shouldShowInvalid = !isValid && (hasBlurred || hasSubmitted);
  const errorMessage = useMemo(() => {
    const word = name === 'message' ? 'a' : 'your';

    return isValid || (!hasBlurred && !hasSubmitted)
      ? null
      : !value.trim() || type === 'textarea'
      ? `Please enter ${word} ${name}`
      : `Please enter a valid ${name}`;
  }, [hasBlurred, hasSubmitted, isValid, name, type, value]);

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

const validations: ValidationFunctions = {
  name: (v: string) => v.length >= 2,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
  message: (v: string) => v.length >= 3
};

type FormState = {
  name: string;
  email: string;
  message: string;
};

type ValidationFunctions = {
  [key in keyof FormState]: (v: string) => boolean;
};

type FieldProps = {
  name: keyof FormState;
  value: string;
  label: string;
  className?: string;
  icon?: ReactNode;
  placeholder?: string;
  type?: string;
  isValid: boolean;
  hasSubmitted: boolean;
  onChange: (name: keyof FormState, value: string) => void;
};
