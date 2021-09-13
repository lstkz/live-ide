import fs from 'fs';
import * as Path from 'path';
import { decrypt, encrypt } from './cipher';
import { AppConfig } from './types';

type EncryptedConfigType = 'stage' | 'prod';
type ConfigType = 'test' | 'dev' | EncryptedConfigType;

function getPassword(type: ConfigType) {
  const prop = `${type}_CONFIG_PASSWORD`.toUpperCase();
  const keyFile = Path.join(__dirname, `${type}.key.txt`);
  if (fs.existsSync(keyFile)) {
    return fs.readFileSync(keyFile, 'utf-8').trim();
  }
  const password = process.env[prop];
  if (!password) {
    throw new Error('Password config not defined: ' + prop);
  }
  return password;
}

function getType(configType?: ConfigType) {
  if (process.env.NODE_ENV === 'test') {
    return 'test';
  }
  return configType || ((process.env.CONFIG_NAME || 'dev') as ConfigType);
}

export function getConfig(configType?: ConfigType): AppConfig {
  const type = getType(configType);
  if (!['test', 'dev', 'stage', 'prod'].includes(type)) {
    throw new Error('Invalid config name: ' + type);
  }
  if (type === 'dev') {
    return require('./dev').config;
  }
  if (type === 'test') {
    return require('./test').config;
  }
  const password = getPassword(type);
  const encrypted = fs.readFileSync(getEncryptedPath(type), 'utf8');
  return decrypt(encrypted, password);
}

export function getPasswordEnv(configType?: ConfigType) {
  const type = getType(configType);
  if (type === 'dev' || type === 'test') {
    return {
      CONFIG_NAME: type,
    };
  }
  const password = getPassword(type);
  return {
    CONFIG_NAME: type,
    [`${type.toUpperCase()}_CONFIG_PASSWORD`]: password,
  };
}

export function getMaybeStagePasswordEnv(stage?: boolean) {
  return getPasswordEnv(stage ? 'stage' : undefined);
}

export function encryptConfig(type: ConfigType) {
  const config = require('./' + type).config;
  if (!config) {
    throw new Error('Invalid config');
  }
  const password = getPassword(type);
  const encrypted = encrypt(config, password);
  fs.writeFileSync(getEncryptedPath(type), encrypted);
}

function getEncryptedPath(type: ConfigType) {
  return Path.join(__dirname, `${type}.encrypted.txt`);
}

export const config = getConfig();
