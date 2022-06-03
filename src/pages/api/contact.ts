import {
  validations,
  validateField,
  defaultErrorMessage,
  type ContactFormData
} from '@elements/ContactForm';
import rateLimit from '@utils/rate-limit';
import { sleep, isValidDate } from '@helpers';
import sendgrid, { type ResponseError } from '@sendgrid/mail';
import type { NextApiRequest, NextApiResponse } from 'next';

sendgrid.setApiKey(process.env.SENDGRID_SECRET_KEY!);

const successMessage = 'Thank you, your submission has been received';
const minTime = 5000; // Ignore bots who submit the form too quickly
const maxRequestsPerMinute = 5;

const limiter = rateLimit({
  interval: 6000,
  uniqueTokenPerInterval: 500,
  defaultToken: 'CONTACT_FORM_API'
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactFormResponse>
) {
  try {
    await limiter.check(req, res, maxRequestsPerMinute);
  } catch {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  try {
    const data: ContactFormRequest =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Spam filters
    const pageLoadTime = new Date(data.timestamp);
    const formSubmitTime = new Date();

    if (
      !data.hasOwnProperty('honeypot') ||
      !!data.honeypot ||
      !isValidDate(pageLoadTime) ||
      formSubmitTime.getTime() - pageLoadTime.getTime() < minTime
    ) {
      await sleep(2000);
      return res.status(200).json({ message: successMessage });
    }

    const validationErrors: ValidationErrors = {};
    const keys = Object.keys(validations) as (keyof ContactFormData)[];

    for (const name of keys) {
      const value = String(data[name] ?? '');
      const { value: isValid, message } = validateField(name, value);

      if (isValid) {
        continue;
      }

      validationErrors[name] = message;
    }

    if (Object.keys(validationErrors).length) {
      return res.status(422).json({ validationErrors });
    }

    try {
      await sendEmailNotification(data);
      res.status(200).json({ message: successMessage });
    } catch (e) {
      const error = e as ResponseError;

      console.error(
        error.response?.body ?? error.message ?? 'Failed to send email'
      );

      res.status(error.code ?? 500).json({ error: defaultErrorMessage });
    }
  } catch {
    res.status(422).json({ error: 'Invalid form data' });
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

export type ContactFormRequest = ContactFormData & {
  timestamp: Date;
  honeypot: string;
};

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
