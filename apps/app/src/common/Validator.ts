import { FieldError, ResolverResult } from 'react-hook-form';
import { EMAIL_REGEX } from 'shared';
import { safeKeys } from './helper';

export class Validator<T extends object> {
  errors: {
    [x in keyof T]?: string;
  } = {};

  constructor(private data: T) {}

  required(field: keyof T, message?: string) {
    const value: any = this.data[field];
    if (!this.errors[field] && !value && value !== 0) {
      this.errors[field] = message ?? 'This field is required.';
    }
    return this;
  }

  email(field: keyof T, message?: string) {
    const value: any = this.data[field];
    if (!this.errors[field] && !EMAIL_REGEX.test(value ?? '')) {
      this.errors[field] = message ?? 'Invalid email address.';
    }
    return this;
  }

  regex(field: keyof T, regex: RegExp, message: string) {
    const value: any = this.data[field];
    if (value && !this.errors[field] && !regex.test(value ?? '')) {
      this.errors[field] = message;
    }
    return this;
  }

  minLength(field: keyof T, minLength: number, message?: string) {
    const value: any = this.data[field];
    if (!this.errors[field] && value.length < minLength) {
      this.errors[field] = message ?? `Minimum ${minLength} characters.`;
    }
    return this;
  }

  maxLength(field: keyof T, maxLength: number, message?: string) {
    const value: any = this.data[field];
    if (!this.errors[field] && value.length > maxLength) {
      this.errors[field] = message ?? `Maximum ${maxLength} characters.`;
    }
    return this;
  }

  custom(field: keyof T, fn: (data: T) => string | null) {
    if (!this.errors[field]) {
      const error = fn(this.data);
      if (error) {
        this.errors[field] = error;
      }
    }
    return this;
  }

  validate(): ResolverResult<T> {
    if (Object.keys(this.errors).length) {
      const mappedErrors: any = {};
      safeKeys(this.errors).map(key => {
        mappedErrors[key] = {
          type: 'validate',
          message: this.errors[key],
        } as FieldError;
      });
      return {
        values: {},
        errors: mappedErrors,
      };
    }
    return {
      errors: {},
      values: this.data as any,
    };
  }

  touch(fn: (validator: this) => void) {
    fn(this);
    return this;
  }
}
