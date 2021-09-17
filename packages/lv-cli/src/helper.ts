import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import { ChildProcess } from 'child_process';
import { libs, rootPath, apps, rootApps } from './config';

function isLib(app: string) {
  return libs.includes(app);
}

function isRootApps(app: string) {
  return rootApps.includes(app);
}

export function getAppRoot(app: string) {
  return path.join(
    rootPath,
    isLib(app) ? 'packages' : isRootApps(app) ? '' : 'apps',
    app
  );
}

export function getSpawnOptions(app: string) {
  return {
    shell: true,
    cwd: getAppRoot(app),
    stdio: 'inherit' as const,
  };
}

export function validateApp(app: string) {
  if (apps.includes(app)) {
    return;
  }
  const lines = [`Supported apps: ${apps.join(', ')}`];
  const error = `Invalid app '${app}'.`;
  if (lines.length === 1) {
    console.log(error, lines[0]);
  } else {
    console.log(error);
    console.log(lines.join('\n'));
  }
  console.log(`Invalid app '${app}'.`);
  process.exit(1);
}

export function cpToPromise(cp: ChildProcess) {
  return new Promise<void>((resolve, reject) => {
    cp.addListener('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('Exited with ' + code));
      }
    });
    cp.addListener('error', e => reject(e));
  });
}

export async function getStack(stackName: string) {
  const cf = new AWS.CloudFormation();
  const { Stacks: stacks } = await cf
    .describeStacks({
      StackName: stackName,
    })
    .promise();
  const stack = stacks && stacks[0];
  if (!stack) {
    throw new Error(`Stack ${stackName} not found`);
  }
  return stack;
}

export function getStackOutput(stack: AWS.CloudFormation.Stack, name: string) {
  const output = (stack.Outputs || []).find(x => x.OutputKey === name);
  if (!output) {
    throw new Error(`Output not found: ${name}`);
  }
  if (!output.OutputValue) {
    throw new Error(`Output not set: ${output}`);
  }
  return output.OutputValue;
}

export function walk(dir: string) {
  const results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results.push(...walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

export function getModulePath(moduleNr: number) {
  const modules = path.join(rootPath, 'content/modules');
  const folderContent = fs.readdirSync(modules);
  const moduleName = folderContent.find(x => x.startsWith(`${moduleNr}-`));
  if (!moduleName) {
    throw new Error(`Module ${moduleNr} does not exist`);
  }
  const modulePath = path.join(modules, moduleName);
  return { moduleName, modulePath };
}

export async function checkS3KeyExists(
  s3: AWS.S3,
  bucketName: string,
  key: string
) {
  return await s3
    .headObject({
      Bucket: bucketName,
      Key: key,
    })
    .promise()
    .then(
      () => true,
      err => {
        if (err.code === 'NotFound') {
          return false;
        }
        throw err;
      }
    );
}
