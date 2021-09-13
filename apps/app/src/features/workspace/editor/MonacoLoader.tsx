import loader from '@monaco-editor/loader';
import { Monaco } from 'src/types';

export class MonacoLoader {
  monaco: Monaco = null!;

  async init() {
    loader.config({
      paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.27.0/min/vs',
      },
    });
    this.monaco = await loader.init();
  }

  getMonaco() {
    if (!this.monaco) {
      throw new Error('Monaco not loaded');
    }
    return this.monaco;
  }
}
