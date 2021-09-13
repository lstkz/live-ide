import { createCollection } from '../db';

export interface FlagModel {
  _id: string;
}

export const FlagCollection = createCollection<FlagModel>('flag');
