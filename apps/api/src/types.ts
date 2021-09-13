import { Request, Response, NextFunction } from 'express';
import { ExtractType } from 'shared';
import { UserModel } from './collections/User';

export type Handler = (req: Request, res: Response, next: NextFunction) => void;

export interface AppUser extends UserModel {
  accessToken: string;
}

declare module 'express' {
  interface Request {
    user: AppUser;
  }
}

export type AppTask = { type: 'example'; payload: {} };

export type AppEvent = { type: 'example'; payload: {} };

export type AppEventType = ExtractType<Pick<AppEvent, 'type'>>;
export type AppTaskType = ExtractType<Pick<AppTask, 'type'>>;

export type MapProps<T, K> = Omit<T, keyof K> & K;
