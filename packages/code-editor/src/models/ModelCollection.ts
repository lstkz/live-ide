import type { editor } from 'monaco-editor';
import * as R from 'remeda';
import { TypedEventEmitter } from '../lib/TypedEventEmitter';
import { CodeModel } from './CodeModel';
import { CodeActionsCallbackMap, MarkerSeverity, Monaco } from '../types';
import { HighlighterService } from '../services/HighlighterService';

interface EditorFile {
  id: string;
  path: string;
  source: string;
}

export class ModelCollection {
  private monaco: Monaco = null!;
  private editor: editor.IStandaloneCodeEditor = null!;
  private codeModels: CodeModel[] = [];
  private libs: editor.ITextModel[] = [];

  constructor(
    private emitter: TypedEventEmitter<CodeActionsCallbackMap>,
    private highlighter: HighlighterService
  ) {}

  init(monaco: Monaco, editor: editor.IStandaloneCodeEditor) {
    this.monaco = monaco;
    this.editor = editor;
    editor.onDidChangeModelDecorations(() => {
      const markers = monaco.editor.getModelMarkers({});
      const currentErrorMap = R.pipe(
        markers,
        R.filter(x => x.severity === MarkerSeverity.Error),
        R.indexBy(x => x.resource.toString())
      );
      this.codeModels.forEach(model => {
        model.setHasError(!!currentErrorMap[model.uri.toString()]);
      });
    });
  }

  async addLib(name: string, url: string) {
    const source = await fetch(url).then(x => x.text());
    const lib = this.monaco.editor.createModel(
      source,
      'typescript',
      this.monaco.Uri.parse(`file:///node_modules/${name}/index.d.ts`)
    );
    this.libs.push(lib);
  }

  async addLibBundle(name: string, url: string) {
    const sourceMap: Record<string, string> = await fetch(url).then(x =>
      x.json()
    );
    Object.keys(sourceMap).forEach(fileName => {
      const source = sourceMap[fileName];
      const lib = this.monaco.editor.createModel(
        source,
        'typescript',
        this.monaco.Uri.parse(`file:///node_modules/${name}/${fileName}`)
      );
      this.libs.push(lib);
    });
  }

  addFile(file: EditorFile) {
    const codeModel = new CodeModel(
      this.monaco,
      this.editor,
      this.emitter,
      this.highlighter,
      file.id,
      file.source,
      file.path
    );
    this.codeModels.push(codeModel);
  }

  replaceFiles(files: EditorFile[]) {
    const fixPath = (path: string) => path.replace(/^\./, '');
    const currentMap = R.indexBy(this.codeModels, x => x.uri.path);
    const newMap = R.indexBy(files, x => fixPath(x.path));
    const currentPaths = this.codeModels.map(x => x.uri.path);
    const newPaths = files.map(x => fixPath(x.path));
    const updatePaths = R.intersection(currentPaths, newPaths);
    const addPaths = R.difference(newPaths, currentPaths);
    const removePaths = R.difference(currentPaths, newPaths);
    removePaths.forEach(path => {
      const node = currentMap[path];
      this.removeFile(node.id);
    });
    addPaths.forEach(path => {
      const file = newMap[path];
      this.addFile(file);
    });
    updatePaths.forEach(path => {
      const node = currentMap[path];
      const file = newMap[path];
      node.replace(file.id, file.source);
    });
  }

  removeFile(id: string) {
    const model = this.getModelByIdOrError(id);
    model.dispose();
    this.codeModels.splice(this.codeModels.indexOf(model), 1);
  }

  async save() {
    await this.editor
      .getAction('editor.action.formatDocument')
      .run()
      .catch(() => {
        // ignore
      });
    this.codeModels.forEach(model => {
      model.save();
    });
  }

  openFile(input: editor.ITextResourceEditorInput | string | null) {
    if (input == null) {
      this.editor.setModel(null);
      return;
    }
    if (typeof input === 'string') {
      this.getModelById(input)?.open();
      return;
    }
    const model = this.codeModels.find(x => x.uri.path === input.resource.path);
    if (!model) {
      return;
    }
    model.open();
    if (input.options?.selection) {
      model.showSelection(input.options.selection);
    }
  }

  getFileMap() {
    const map: Record<string, { code: string }> = {};
    this.codeModels.forEach(model => {
      map['.' + model.uri.path] = {
        code: model.committedText,
      };
    });
    return map;
  }

  revertDirty(id: string) {
    this.getModelByIdOrError(id).revertDirty();
  }

  changeFilePath(id: string, newPath: string) {
    this.getModelByIdOrError(id).changeFilePath(newPath);
  }

  dispose() {
    this.libs.forEach(lib => {
      lib.dispose();
    });
    this.codeModels.forEach(model => {
      model.dispose();
    });
  }

  ///

  private getModelById(id: string) {
    return this.codeModels.find(x => x.id === id);
  }
  private getModelByIdOrError(id: string) {
    const model = this.getModelById(id);
    if (!model) {
      throw new Error('Model not found: ' + id);
    }
    return model;
  }
}
