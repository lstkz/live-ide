import { createCollection } from '../db';

export interface BundleHashModel {
  _id: string;
  createdAt: Date;
}

export const BundleHashCollection =
  createCollection<BundleHashModel>('bundleHash');
