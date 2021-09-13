import { createCollection } from '../db';

export interface TemplateFile {
  name: string;
  directory: string;
  content: string;
}

export interface TemplateModel {
  _id: string;
  name: string;
  files: TemplateFile[];
}

export const TemplateCollection = createCollection<TemplateModel>('template');
