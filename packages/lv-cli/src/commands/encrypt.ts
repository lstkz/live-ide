import { encryptConfig } from 'config';
import program from 'commander';

export function init() {
  program.command('encrypt <type>').action(async type => {
    await encryptConfig(type);
  });
}
