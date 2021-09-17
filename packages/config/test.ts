import { AppConfig } from './types';

export const config: AppConfig = {
  logLevel: 'debug',
  appBaseUrl: 'http://app.example.org',
  apiBaseUrl: 'http://api.example.org',
  cdnBaseUrl: 'http://cdn.example.org',
  iframe: {
    origin: 'http://localhost:1234',
    parentOrigin: 'http://localhost:12345',
  },
  mongodb: {
    url: 'mongodb://localhost:27017',
    dbName: 'pd-test',
  },
  rabbit: {
    hosts: ['localhost'],
    username: 'guest',
    password: 'guest',
    prefetchLimit: 10,
  },
  adminToken: 'admin-test',
  aws: {
    region: 'test',
    s3Bucket: 's3-bucket-123',
  },
  workspace: {
    expirationHours: 3,
  },
  api: {
    port: 3000,
    eventQueueSuffix: 'app',
  },
  web: {
    port: 4000,
  },
  bugsnag: {
    apiKey: -1,
    workerKey: -1,
    frontKey: -1,
  },
  mixpanel: {
    apiKey: -1,
  },
  github: {
    clientId: 'mocked',
    clientSecret: 'mocked',
  },
  google: {
    clientId: 'mocked',
    clientSecret: 'mocked',
  },
  mailjet: {
    privateKey: 'privateKey',
    publicKey: 'publicKey',
    senderEmail: 'sender@example.org',
    senderName: 'name',
    templates: {
      actionButton: 123,
    },
  },
};
