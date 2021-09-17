import { createCollection } from '../db';

export interface {{name}}Model {
  foo: string;
}

export const {{name}}Collection = createCollection<{{name}}Model>(
  '{{camelCase name}}'
);
