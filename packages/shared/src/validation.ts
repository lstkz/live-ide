import { S } from 'schema';

export const PASSWORD_MIN_LENGTH = 5;
export const getPasswordSchema = () => S.string().min(PASSWORD_MIN_LENGTH);
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,30}$/i;
export const getUsernameSchema = () =>
  S.string()
    .trim()
    .regex(USERNAME_REGEX)
    .min(USERNAME_MIN_LENGTH)
    .max(USERNAME_MAX_LENGTH);

export const EMAIL_REGEX = /^[a-zA-Z0-9._\-+]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

export const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%_+.~#?&//=]{1,256}\.[a-z]{1,10}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?$/;

export const FILENAME_REGEX = /^[\w\-. ]+$/;
export const FILENAME_MAX_LENGTH = 50;

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
