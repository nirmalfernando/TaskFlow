import { z } from 'zod';

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const PASSWORD_REGEX = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /[0-9]/,
};

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .regex(EMAIL_REGEX, 'Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(PASSWORD_REGEX.uppercase, 'Must contain at least one uppercase letter')
  .regex(PASSWORD_REGEX.lowercase, 'Must contain at least one lowercase letter')
  .regex(PASSWORD_REGEX.digit, 'Must contain at least one number');
