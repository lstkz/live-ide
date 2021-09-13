import { createCollection } from '../db';

interface TemplateFile {
  name: string;
  content: string;
}

export interface TemplateModel {
  _id: string;
  name: string;
  files: TemplateFile[];
}

export const TemplateCollection = createCollection<TemplateModel>('template');
