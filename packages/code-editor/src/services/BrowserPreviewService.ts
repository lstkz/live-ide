import { IframeCallbackMessage, IframeMessage } from 'shared';
import { BundleData, LibraryDep } from '../types';

export class BrowserPreviewService {
  private iframe: HTMLIFrameElement = null!;
  private markLoaded: () => void = null!;
  private loadedPromise: Promise<void> = null!;
  private importMap: Record<string, string> = {};
  private lastInjectedCode: BundleData | null = null;
  private lastError: any | null = null;
  private onMessage: (e: MessageEvent<any>) => void = null!;

  constructor(private iframeOrigin: string) {
    this.loadedPromise = new Promise<void>(resolve => {
      this.markLoaded = resolve;
    });
  }

  load(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
    this.markLoaded();
    this.onMessage = e => {
      if (e.origin !== this.iframeOrigin) {
        return;
      }
      const action = e.data as IframeCallbackMessage;
      if (action.target !== 'preview') {
        return;
      }
      switch (action.type) {
        case 'hard-reload': {
          if (!this.iframe) {
            return;
          }
          if (this.lastInjectedCode) {
            this.inject(this.lastInjectedCode);
          }
          if (this.lastError) {
            this.showError(this.lastError);
          }
          break;
        }
      }
    };
    window.addEventListener('message', this.onMessage);
  }

  dispose() {
    window.removeEventListener('message', this.onMessage);
  }

  async waitForLoad() {
    return this.loadedPromise;
  }

  setImportMap(importMap: Record<string, string>) {
    this.importMap = importMap;
  }

  setLibraries(libraries: LibraryDep[]) {
    const map: Record<string, string> = {};
    libraries.forEach(lib => {
      map[lib.name] = lib.source;
    });
    this.importMap = map;
  }

  inject(data: BundleData) {
    this.lastError = null;
    this.lastInjectedCode = data;
    this.sendMessage({
      type: 'inject',
      payload: { data, importMap: this.importMap },
    });
  }

  showError(error: any) {
    this.lastError = error;
    this.lastInjectedCode = null;
    this.sendMessage({
      type: 'error',
      payload: { error },
    });
  }

  private sendMessage(message: IframeMessage) {
    if (!this.iframe.contentWindow) {
      return;
    }
    this.iframe.contentWindow.postMessage(message, this.iframeOrigin);
  }
}
