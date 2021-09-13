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

export type EmailTemplate = {
  type: 'actionButton';
  variables: {
    subject: string;
    title: string;
    content: string;
    link_text: string;
    link_url: string;
  };
};

export interface SendEmailTask {
  type: 'SendEmail';
  payload: {
    to: string;
    template: EmailTemplate;
  };
}

export interface CreateEmailContactTask {
  type: 'CreateEmailContact';
  payload: {
    email: string;
    subscribe: boolean;
  };
}
export interface UpdateNewsletterSettingsTask {
  type: 'UpdateNewsletterSettings';
  payload: {
    email: string;
    subscribe: boolean;
  };
}

export interface TestSubmissionTask {
  type: 'TestSubmission';
  payload: {
    submissionId: string;
  };
}

export interface CloneWorkspaceFilesTask {
  type: 'CloneWorkspaceFiles';
  payload: {
    submissionId: string;
  };
}

export interface ButtonActionTemplateProps {
  unsubscribeLink?: string;
  header: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

export type AppTask =
  | SendEmailTask
  | TestSubmissionTask
  | CloneWorkspaceFilesTask
  | CreateEmailContactTask
  | UpdateNewsletterSettingsTask;

export interface UserRegisteredEvent {
  type: 'UserRegistered';
  payload: { userId: string };
}

export interface UserEmailVerifiedEvent {
  type: 'UserEmailVerified';
  payload: { userId: string };
}

export interface UserEmailUpdatedEvent {
  type: 'UserEmailUpdated';
  payload: { userId: string };
}

export interface SubmissionCreatedEvent {
  type: 'SubmissionCreated';
  payload: {
    submissionId: string;
  };
}
export interface SubmissionPassedEvent {
  type: 'SubmissionPassed';
  payload: {
    submissionId: string;
  };
}

export interface SolutionCreatedEvent {
  type: 'SolutionCreated';
  payload: {
    solutionId: string;
  };
}

export interface SolutionDeletedEvent {
  type: 'SolutionDeleted';
  payload: {
    solutionId: string;
    userId: string;
    submissionId: string;
    challengeId: string;
  };
}

export interface ChallengeSolvedEvent {
  type: 'ChallengeSolved';
  payload: {
    userId: string;
    challengeId: string;
    moduleId: number;
  };
}

export type AppEvent =
  | UserRegisteredEvent
  | UserEmailVerifiedEvent
  | UserEmailUpdatedEvent
  | SubmissionCreatedEvent
  | SubmissionPassedEvent
  | SolutionCreatedEvent
  | SolutionDeletedEvent
  | ChallengeSolvedEvent;

export type AppEventType = ExtractType<Pick<AppEvent, 'type'>>;
export type AppTaskType = ExtractType<Pick<AppTask, 'type'>>;

export type MapProps<T, K> = Omit<T, keyof K> & K;
