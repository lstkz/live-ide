import type { editor } from 'monaco-editor';
import { ThemeService } from './ThemeService';
import { HighlighterAction, HighlighterCallbackAction, Monaco } from '../types';

const DEBUG_TYPE = process.env.NODE_ENV === 'development';

interface CallbackDefer {
  resolve: (decorations: editor.IModelDeltaDecoration[]) => void;
  reject: (err: any) => void;
}

export class HighlighterService {
  private worker: Worker = null!;
  private version = 0;
  private deferMap: Record<number, CallbackDefer> = {};
  private monaco: Monaco = null!;

  constructor(private themer: ThemeService) {}

  init(monaco: Monaco) {
    this.monaco = monaco;
    if (this.worker) {
      return;
    }
    this.worker = new Worker(
      new URL('./HighlighterService.worker.ts', import.meta.url)
    );
    this.worker.addEventListener('message', e => {
      const action = e.data as HighlighterCallbackAction;
      const { classifications, version } = action.payload;
      const defer = this.deferMap[version];
      delete this.deferMap[version];
      const decorations = classifications.map(classification => {
        let className = this.themer.getClassNameForScope(classification.scope);
        if (DEBUG_TYPE) {
          className += ' ' + classification.scope.replaceAll('.', '_');
        }
        return {
          range: new this.monaco.Range(
            classification.startLine,
            classification.start,
            classification.endLine,
            classification.end
          ),
          options: {
            inlineClassName: className,
          },
        };
      });
      defer.resolve(decorations);
    });
  }

  highlight = async (code: string, lang: string) => {
    return new Promise<editor.IModelDeltaDecoration[]>((resolve, reject) => {
      const version = ++this.version;
      this.deferMap[version] = {
        reject,
        resolve,
      };
      this.sendMessage({
        type: 'highlight',
        payload: {
          lang,
          code,
          version,
        },
      });
    });
  };

  dispose() {
    this.worker?.terminate();
    this.worker = null!;
  }

  private sendMessage(action: HighlighterAction) {
    this.worker.postMessage(action);
  }
}
