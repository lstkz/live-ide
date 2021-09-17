import { Bundle } from 'shared';
import { createCollection } from '../db';

export interface BundleCacheModel {
  _id: string;
  sourceBundles: Bundle[];
  typesBundles: Bundle[];
}

export const BundleCacheCollection =
  createCollection<BundleCacheModel>('bundleCache');
