module.exports = {
  apps: [
    {
      name: 'api',
      script: 'yarn run start:api',
      env: {
        CONFIG_NAME: 'prod',
        NODE_ENV: 'production',
      },
    },
    {
      name: 'worker',
      script: 'yarn run start:worker',
      env: {
        CONFIG_NAME: 'prod',
        NODE_ENV: 'production',
      },
    },
    {
      name: 'app',
      script: 'yarn run start:app',
      env: {
        CONFIG_NAME: 'prod',
        NODE_ENV: 'production',
      },
    },
  ],
};
