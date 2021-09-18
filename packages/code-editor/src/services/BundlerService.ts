import {
  BundleData,
  BundlerAction,
  BundlerCallbackAction,
  SourceCode,
} from '../types';
import { BrowserPreviewService } from './BrowserPreviewService';

export interface BundleOptions {
  input: string;
  modules: Record<string, SourceCode>;
}

interface CallbackDefer {
  resolve: (data: BundleData) => void;
  reject: (err: any) => void;
}

interface LoadCodeOptions {
  inputFile: string;
  fileMap: Record<
    string,
    {
      code: string;
    }
  >;
}

export class BundlerService {
  private worker: Worker = null!;
  private version = 1;
  private defer: CallbackDefer = null!;
  private isInited = false;

  constructor(private browserPreviewService: BrowserPreviewService) {}

  init() {
    if (this.isInited) {
      return;
    }
    this.isInited = true;
    this.worker = new Worker(
      new URL('./BundlerService.worker.ts', import.meta.url)
    );
    this.worker.addEventListener('message', e => {
      const action = e.data as BundlerCallbackAction;
      const { version } = action.payload;
      if (this.version !== version || !this.defer) {
        return;
      }
      switch (action.type) {
        case 'bundled': {
          const { code, css } = action.payload;
          this.defer.resolve({ code, css });
          break;
        }
        case 'error': {
          const { error } = action.payload;
          this.defer.reject(error);
          break;
        }
      }
    });
  }
  private async bundle(options: BundleOptions): Promise<BundleData> {
    const version = ++this.version;
    return new Promise<BundleData>((resolve, reject) => {
      this.defer = {
        resolve,
        reject,
      };
      this.sendMessage({
        type: 'bundle',
        payload: {
          ...options,
          version,
        },
      });
    });
  }

  dispose() {
    this.worker?.terminate();
    this.worker = null!;
  }

  loadCode(options: LoadCodeOptions) {
    this.loadCodeAsync(options).catch(e => {
      this.browserPreviewService.showError(e);
    });
  }

  private sendMessage(action: BundlerAction) {
    this.worker.postMessage(action);
  }

  async loadCodeAsync(options: LoadCodeOptions) {
    const { fileMap, inputFile } = options;
    const code = await this.bundle({
      input: inputFile,
      modules: fileMap,
    });
    await this.browserPreviewService.inject(code);
    return code;
  }
}
