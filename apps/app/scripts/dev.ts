import { getConfig } from 'config';
import { runScript } from './run';
import { fixTestConfig } from './_utils';

const config = getConfig('dev');
fixTestConfig(config);
runScript(config, `yarn run next dev -p ${config.web.port}`, 'development');
