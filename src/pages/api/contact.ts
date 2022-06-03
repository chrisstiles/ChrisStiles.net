import {
  validations,
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

const limiter = rateLimit({
  interval: 6000,
  uniqueTokenPerInterval: 500,
  defaultToken: 'CONTACT_FORM_API'
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactFormResponse>
) {
  const ip = [req.headers['x-forwarded-for'] ?? 'CONTACT_FORM_API'].flat()[0];
  console.log('IP', ip);
  console.log('Headers\n', req.headers);

  try {
    await limiter.check(req, res, 1);
  } catch {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  console.log('Not limited');

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
      console.log('SPAM FILTERED');
      await sleep(2500);
      return res.status(200).json({ message: successMessage });
    }

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
        res.status(200).json({ message: successMessage });
      } catch (e) {
        const error = e as ResponseError;

        console.error(
          error.response?.body ?? error.message ?? 'Failed to send email'
        );

        res.status(error.code ?? 500).json({ error: defaultErrorMessage });
      }
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
