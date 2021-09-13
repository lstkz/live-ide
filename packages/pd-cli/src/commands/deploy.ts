import AWS from 'aws-sdk';
import { spawn } from 'child_process';
import Path from 'path';
import program from 'commander';
import mime from 'mime-types';
import fs from 'mz/fs';
import { getSpawnOptions, cpToPromise, getAppRoot, walk } from '../helper';
import { getConfig, getMaybeStagePasswordEnv } from 'config';

const s3 = new AWS.S3();

async function uploadS3(
  name: string,
  bucketName: string,
  suffix: string,
  filter: (path: string) => boolean = () => true
) {
  const [app, ...folder] = name.split('/');
  const frontRoot = getAppRoot(app);
  const buildDir = Path.join(frontRoot, ...folder);
  const files = walk(buildDir);

  await Promise.all(
    files
      .filter(path => !path.endsWith('.DS_Store'))
      .filter(filter)
      .map(async filePath => {
        const contentType = mime.lookup(filePath) || 'text/plain';
        const noCache =
          filePath.endsWith('.html') ||
          filePath.endsWith('app-data.json') ||
          filePath.includes('page-data');
        const file =
          suffix + Path.relative(buildDir, filePath).replace(/\\/g, '/');
        await s3
          .upload({
            Bucket: bucketName,
            Key: file,
            Body: await fs.readFile(filePath),
            ContentType: contentType,
            CacheControl: noCache ? `max-age=0` : undefined,
          })
          .promise();
      })
  );
}

export function init() {
  program
    .command('deploy')
    .option('--stage', 'deploy to stage')
    .option('--prod', 'deploy to prod')
    .option('--no-build', 'skip build')
    .action(async ({ stage, prod, build }) => {
      if (!stage && !prod) {
        throw new Error('stage or prod must be defined');
      }
      if (build) {
        const config = getConfig(stage ? 'stage' : 'prod');
        await Promise.all([
          cpToPromise(
            spawn('yarn', ['run', 'build'], {
              env: {
                ...process.env,
              },
              ...getSpawnOptions('tester'),
            })
          ),
          cpToPromise(
            spawn('yarn', ['run', 'build'], {
              env: {
                ...process.env,
                ...getMaybeStagePasswordEnv(stage),
              },
              ...getSpawnOptions('app'),
            })
          ),
          cpToPromise(
            spawn('yarn', ['run', 'build'], {
              env: {
                ...process.env,
                ...getMaybeStagePasswordEnv(stage),
              },
              ...getSpawnOptions('iframe'),
            })
          ),
        ]);
        await await Promise.all([
          uploadS3(
            'app/.next/static',
            config.aws.s3Bucket,
            'cdn/_next/static/'
          ),
          uploadS3('iframe/build', config.aws.s3Bucket, 'iframe/'),
          uploadS3(
            'app/public',
            config.aws.s3Bucket,
            'cdn/',
            path => path.includes('onigasm.wasm') || path.includes('/grammars/')
          ),
        ]);
      }
      await cpToPromise(
        spawn('pulumi', ['up', '-s', stage ? 'dev' : 'prod', '-y'], {
          env: {
            ...process.env,
            ...getMaybeStagePasswordEnv(stage),
          },
          ...getSpawnOptions('deploy'),
        })
      );
    });
}
