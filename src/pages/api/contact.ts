import {
  validations,
  defaultErrorMessage,
  type ContactFormData
} from '@elements/ContactForm';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactFormResponse>
) {
  const data: ContactFormData =
    typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  // TODO Add spam filter with honeypot
  // TODO Send submission data to email
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
    res.status(200).json({
      message: 'Thank you, your submission has been received'
    });
  }
}

export type ContactFormResponse = {
  message?: string;
  validationErrors?: ValidationErrors & {
    name?: string;
    email?: string;
    message?: string;
  };
};

type ValidationErrors = {
  [key in keyof Partial<ContactFormData>]: string;
};
