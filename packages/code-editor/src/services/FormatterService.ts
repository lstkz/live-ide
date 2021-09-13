import { FormatterAction, FormatterCallbackAction } from '../types';

interface CallbackDefer {
  resolve: (code: string) => void;
  reject: (err: any) => void;
}

export class FormatterService {
  private worker: Worker = null!;
  private version = 0;
  private deferMap: Record<number, CallbackDefer> = {};

  init() {
    if (this.worker) {
      return;
    }
    this.worker = new Worker(
      new URL('./FormatterService.worker.ts', import.meta.url)
    );
    this.worker.addEventListener('message', e => {
      const action = e.data as FormatterCallbackAction;
      const { version } = action.payload;
      const defer = this.deferMap[version];
      delete this.deferMap[version];
      switch (action.type) {
        case 'error': {
          const { error } = action.payload;
          defer.reject(error);
          break;
        }
        case 'highlight': {
          const { code } = action.payload;
          defer.resolve(code ?? '');
          break;
        }
      }
    });
  }

  dispose() {
    this.worker?.terminate();
    this.worker = null!;
  }

  formatCode(lang: string, code: string) {
    return new Promise<string>((resolve, reject) => {
      const version = ++this.version;
      this.deferMap[version] = {
        reject,
        resolve,
      };
      this.sendMessage({
        type: 'format',
        payload: { lang, code, version },
      });
    });
  }

  private sendMessage(action: FormatterAction) {
    this.worker.postMessage(action);
  }
}
