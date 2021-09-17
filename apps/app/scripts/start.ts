import { getConfig } from 'config';
import { runScript } from './run';
import { fixTestConfig } from './_utils';

const config = getConfig();
fixTestConfig(config);

runScript(config, `yarn run next start -p ${config.web.port}`, 'production');
