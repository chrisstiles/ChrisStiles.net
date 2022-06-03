import {
  validations,
  defaultErrorMessage,
  type ContactFormData
} from '@elements/ContactForm';
import sendgrid, { type ResponseError } from '@sendgrid/mail';
import type { NextApiRequest, NextApiResponse } from 'next';

sendgrid.setApiKey(process.env.SENDGRID_SECRET_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactFormResponse>
) {
  const data: ContactFormData =
    typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  // TODO Add spam filter with honeypot
  const validationErrors: ValidationErrors = {};

  for (const [name, validate] of Object.entries(validations)) {
    const key = name as keyof ContactFormData;
    const value = String(data[key] ?? '');
    const isValid = validate(value);

    if (isValid) {
      continue;
    }

    if (!value.trim() || key === 'message') {
      const word = key === 'message' ? 'a' : 'your';
      validationErrors[key] = `Please enter ${word} ${key}`;
    } else {
      validationErrors[key] = `Please enter a valid ${key}`;
    }
  }

  if (Object.keys(validationErrors).length) {
    res.status(422).json({ validationErrors });
  } else {
    try {
      await sendEmailNotification(data);

      res.status(200).json({
        message: 'Thank you, your submission has been received'
      });
    } catch (e) {
      const error = e as ResponseError;
      console.error(
        error.response?.body ?? error.message ?? 'Failed to send email'
      );
      res.status(error.code ?? 500).json({ error: defaultErrorMessage });
    }
  }
}

async function sendEmailNotification(data: ContactFormData) {
  const message = {
    to: process.env.FORM_EMAIL_TO!,
    from: process.env.FORM_EMAIL_FROM!,
    subject: 'Contact form submission - chrisstiles.dev',
    html: `
      <strong>Name:</strong> ${data.name}<br />
      <strong>Email:</strong> ${data.email}<br />
      <strong>Message:</strong><br />
      ${data.message}
    `
  };

  await sendgrid.send(message);
}

export type ContactFormResponse = {
  message?: string;
  error?: string;
  validationErrors?: ValidationErrors & {
    name?: string;
    email?: string;
    message?: string;
  };
};

type ValidationErrors = {
  [key in keyof Partial<ContactFormData>]: string;
};
