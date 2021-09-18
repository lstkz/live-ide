import type { editor } from 'monaco-editor';
import * as R from 'remeda';
import { TypedEventEmitter } from '../lib/TypedEventEmitter';
import { CodeModel } from './CodeModel';
import {
  CodeActionsCallbackMap,
  CodeChangesData,
  CursorUpdatedData,
  MarkerSeverity,
  Monaco,
  SelectionUpdatedData,
} from '../types';
import { HighlighterService } from '../services/HighlighterService';
import { Bundle } from 'shared';

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
    editor.onDidChangeCursorPosition(e => {
      const model = this.getCurrentCodeModel();
      if (model) {
        this.emitter.emit('cursorUpdated', {
          fileId: model.id,
          position: e.position,
          secondaryPositions: e.secondaryPositions,
        });
      } else {
        this.emitter.emit('cursorUpdated', null);
      }
    });
    editor.onDidChangeCursorSelection(e => {
      const model = this.getCurrentCodeModel();
      if (model) {
        this.emitter.emit('selectionUpdated', {
          fileId: model.id,
          selection: e.selection,
          secondarySelections: e.secondarySelections,
        });
      } else {
        this.emitter.emit('selectionUpdated', null);
      }
    });
    editor.onDidBlurEditorText(() => {
      this.emitter.emit('cursorUpdated', null);
    });
    editor.onDidChangeModel(() => {
      this.emitter.emit('selectionUpdated', null);
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
    let mappedName = name.replace('@types/', '');
    if (mappedName.includes('__')) {
      mappedName = '@' + mappedName.replace('__', '/');
    }
    Object.keys(sourceMap).forEach(fileName => {
      const source = sourceMap[fileName];
      const lib = this.monaco.editor.createModel(
        source,
        'typescript',
        this.monaco.Uri.parse(`file:///node_modules/${mappedName}/${fileName}`)
      );
      this.libs.push(lib);
    });
  }

  async addLibBundles(bundles: Bundle[]) {
    this.libs.forEach(lib => {
      lib.dispose();
    });
    this.libs = [];
    await Promise.all(
      bundles.map(bundle => this.addLibBundle(bundle.name, bundle.url))
    );
  }

  async addLibraryUrl(libraryUrl: string) {
    const deps: Record<string, string> = await (await fetch(libraryUrl)).json();
    Object.keys(deps)
      .filter(file => file.endsWith('.d.ts'))
      .forEach(file => {
        const mappedName = file.replace('@types/', '');
        const lib = this.monaco.editor.createModel(
          deps[file],
          'typescript',
          this.monaco.Uri.parse(`file:///node_modules/${mappedName}`)
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

  getFileContent(id: string) {
    const node = this.codeModels.find(x => x.id === id);
    return node ? node.committedText : null;
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

  updateCollaborationCursor(data: CursorUpdatedData) {
    this.codeModels.forEach(model => {
      model.clearDecoration(data.identityId, 'cursor');
    });
    if (!data.fileId || !data.position) {
      return;
    }
    const model = this.getModelById(data.fileId);
    if (!model) {
      return;
    }
    model.applyDecoration(
      data.identityId,
      'cursor',
      [data.position, ...data.secondaryPositions].map(item => ({
        range: new this.monaco.Range(
          item.lineNumber,
          item.column,
          item.lineNumber,
          item.column
        ),
        options: {
          afterContentClassName: data.userClassName,
          beforeContentClassName: data.cursorClassName,
        },
      }))
    );
  }

  updateCollaborationSelection(data: SelectionUpdatedData) {
    this.codeModels.forEach(model => {
      model.clearDecoration(data.identityId, 'selection');
    });
    if (!data.fileId || !data.selection) {
      return;
    }
    const model = this.getModelById(data.fileId);
    if (!model) {
      return;
    }
    model.applyDecoration(
      data.identityId,
      'selection',
      [data.selection, ...data.secondarySelections].map(item => ({
        range: new this.monaco.Range(
          item.startLineNumber,
          item.startColumn,
          item.endLineNumber,
          item.endColumn
        ),
        options: {
          inlineClassName: data.className,
        },
      }))
    );
  }

  updateCollaborationCodeChanges(data: CodeChangesData) {
    const model = this.getModelById(data.fileId);
    if (!model) {
      return;
    }
    model.applyCodeChanges(data.changes);
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
  private getCurrentCodeModel() {
    return this.codeModels.find(model => model.getIsCurrent());
  }
}
