import { useId, type ReactNode } from 'react';
import styles from './ContactForm.module.scss';
import PersonIcon from './person.svg';
import EmailIcon from './email.svg';
import { Button } from '@elements';
import classNames from 'classnames';

export default function ContactForm() {
  return (
    <form>
      <Field
        name="name"
        label="Your name"
        icon={<PersonIcon />}
        placeholder="Enter your name"
      />
      <Field
        name="email"
        type="email"
        label="Email address"
        icon={<EmailIcon />}
        placeholder="Enter your email address"
      />
      <Field
        name="message"
        label="Message"
        type="textarea"
        placeholder="How can I help you?"
      />
      <Button
        type="submit"
        className={styles.submit}
      >
        Send your message
      </Button>
    </form>
  );
}

function Field({
  icon,
  label,
  className,
  type = 'text',
  ...restProps
}: FieldProps) {
  const id = useId();

  const props = {
    id,
    className: classNames(styles.input, className, {
      [styles.hasIcon]: !!icon
    }),
    ...restProps
  };

  return (
    <div className={styles.field}>
      {label && (
        <label
          htmlFor={id}
          className={styles.label}
        >
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {type === 'textarea' ? (
          <textarea {...props} />
        ) : (
          <input
            type={type}
            {...props}
          />
        )}
        {icon && <div className={styles.icon}>{icon}</div>}
      </div>
    </div>
  );
}

type FieldProps = {
  icon?: ReactNode;
  label: string;
  name: string;
  className?: string;
  placeholder?: string;
  type?: string;
};
