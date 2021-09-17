export interface AppConfig {
  logLevel: 'debug' | 'info';
  appBaseUrl: string;
  apiBaseUrl: string;
  cdnBaseUrl: string;
  adminToken: string;
  rabbit: {
    hosts: string[];
    username: string;
    password: string;
    prefetchLimit: number;
    port?: number;
  };
  mongodb: {
    url: string;
    dbName: string;
  };
  workspace: {
    expirationHours: number;
  };
  aws: {
    region: string;
    s3Bucket: string;
    bucketRoleArn: string;
  };
  api: {
    port: number;
    eventQueueSuffix: string;
  };
  web: {
    useCDN: boolean;
    port: number;
  };
  iframe: {
    parentOrigin: string;
    origin: string;
    port?: number;
  };
  bugsnag: {
    apiKey: string | -1;
    frontKey: string | -1;
  };
  github: {
    clientId: string;
    clientSecret: string;
  };
  deploy: {
    cdn: {
      domainName: string;
      certArn: string;
    };
    iframe: {
      domainName: string;
      certArn: string;
    };
    zone: {
      hostedZoneId: string;
    };
  };
}
