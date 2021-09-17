import { ContractMeta, initialize } from 'contract';
import { ObjectSchema, StringSchema } from 'schema';
import AWS from 'aws-sdk';
import { AppEvent, AppEventType, AppTask, AppTaskType, AppUser } from './types';
import { config } from 'config';
import { Ampq } from './ampq/Ampq';
import { ObjectID } from 'mongodb';
import { addShownDownAction } from './shutdown';

export interface BaseBinding<T, U> {
  isBinding: boolean;
  type: T;
  options: U;
}

export interface CreateRpcBindingOptions {
  verified?: true;
  injectUser?: boolean;
  public?: true;
  admin?: true;
  wrapAsValues?: true;
  signature: string;
  handler: ((...args: any[]) => any) & ContractMeta<any>;
}

export interface RpcBinding
  extends BaseBinding<'rpc', CreateRpcBindingOptions> {}

export function createRpcBinding(options: CreateRpcBindingOptions): RpcBinding {
  return {
    isBinding: true,
    type: 'rpc',
    options,
  };
}

type ExtractPayload<T> = T extends { payload: infer S } ? S : never;

type ExtractEvent<T> = ExtractPayload<
  AppEvent extends { type: infer K }
    ? K extends T
      ? Pick<AppEvent, 'payload'>
      : never
    : never
>;

type ExtractTask<T> = ExtractPayload<
  AppTask extends { type: infer K }
    ? K extends T
      ? Pick<AppTask, 'payload'>
      : never
    : never
>;

export interface CreateEventBindingOptions<T extends AppEventType> {
  type: T;
  handler: (messageId: string, event: ExtractEvent<T>) => Promise<void>;
}

export interface CreateTaskBindingOptions<T extends AppTaskType> {
  type: T;
  handler: (messageId: string, task: ExtractTask<T>) => Promise<void>;
}

export interface EventBinding<T extends AppEventType>
  extends BaseBinding<'event', CreateEventBindingOptions<T>> {}

export interface TaskBinding<T extends AppTaskType>
  extends BaseBinding<'task', CreateTaskBindingOptions<T>> {}

export function createEventBinding<T extends AppEventType>(
  options: CreateEventBindingOptions<T>
): EventBinding<T> {
  return {
    isBinding: true,
    type: 'event',
    options,
  };
}

export function createTaskBinding<T extends AppTaskType>(
  options: CreateTaskBindingOptions<T>
): TaskBinding<T> {
  return {
    isBinding: true,
    type: 'task',
    options,
  };
}

AWS.config.update({ region: config.aws.region });

export const s3 = new AWS.S3();

export const route53 = new AWS.Route53();

export const sts = new AWS.STS();

export const lambda = new AWS.Lambda();

export const { createContract } = initialize({
  debug: process.env.NODE_ENV === 'development',
});

declare module 'schema/src/StringSchema' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface StringSchema<TReq, TNull, TOutput> {
    objectId(): StringSchema<TReq, TNull, ObjectID>;
    uuid(): StringSchema<TReq, TNull, TOutput>;
  }
}

declare module 'schema/src/ObjectSchema' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ObjectSchema<TReq, TNull, TKeys> {
    appUser(): ObjectSchema<TReq, TNull, AppUser>;
  }
}

StringSchema.prototype.objectId = function objectId(this: StringSchema) {
  return this.regex(/^[a-f0-9]{24}$/)
    .input(value => (value?.toHexString ? value.toHexString() : value))
    .output<ObjectID>(value => ObjectID.createFromHexString(value));
};

StringSchema.prototype.uuid = function uuid(this: StringSchema) {
  return this.regex(
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$/
  );
};

ObjectSchema.prototype.appUser = function appUser(this: ObjectSchema) {
  return this.as<AppUser>().unknown();
};

export const ampq = new Ampq({
  ...config.rabbit,
  eventQueueSuffix: config.api.eventQueueSuffix,
});

addShownDownAction(50, () => ampq.shutdown());
