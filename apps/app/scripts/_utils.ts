import { AppConfig } from 'config/types';

export function fixTestConfig(config: AppConfig) {
  if (process.env.E2E_TESTS) {
    config.web.port = 4001;
    config.apiBaseUrl = 'http://localhost:3001';
  }
}
