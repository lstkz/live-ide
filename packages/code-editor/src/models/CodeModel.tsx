import * as R from 'remeda';
import type { editor } from 'monaco-editor';
import { TypedEventEmitter } from '../lib/TypedEventEmitter';
import { HighlighterService } from '../services/HighlighterService';
import { CodeActionsCallbackMap, Monaco } from '../types';

function _getModelLanguage(path: string) {
  if (/.tsx?$/.test(path)) {
    return 'typescript';
  }
  if (/.jsx?$/.test(path)) {
    return 'javascript';
  }
  if (/.css$/.test(path)) {
    return 'css';
  }
  if (/.html$/.test(path)) {
    return 'html';
  }
  return 'text';
}

function fixFilePath(path: string) {
  return path.replace(/^\.\//, 'file:///');
}

export class CodeModel {
  public committedText = '';
  private vsModel: editor.ITextModel = null!;
  private isDirty = false;
  private lastHighlighDecorations: string[] = [];
  private hasError = false;
  private isOpened = false;
  private highlighVersion = 0;
  private ext = '';

  constructor(
    private monaco: Monaco,
    private editor: editor.IStandaloneCodeEditor,
    private emitter: TypedEventEmitter<CodeActionsCallbackMap>,
    private highlighter: HighlighterService,
    public id: string,
    source: string,
    path: string
  ) {
    this.createNewModel(source, path);
  }

  get uri() {
    return this.vsModel.uri;
  }

  applyHighlighDecorations(newDecorations: editor.IModelDeltaDecoration[]) {
    this.lastHighlighDecorations = this.vsModel.deltaDecorations(
      this.lastHighlighDecorations,
      newDecorations
    );
  }

  dispose() {
    this.vsModel.dispose();
  }

  save() {
    if (!this.isDirty) {
      return;
    }
    const content = this.vsModel.getValue();
    this.committedText = content;
    this.emitter.emit('saved', {
      fileId: this.id,
      content,
    });
  }

  setHasError(hasError: boolean) {
    if (this.hasError === hasError) {
      return;
    }
    this.hasError = hasError;
    this.emitter.emit('errorsChanged', {
      diffErrorMap: {
        [this.id]: hasError,
      },
    });
  }

  open() {
    if (this.isOpened) {
      return;
    }
    this.editor.setModel(this.vsModel);
    this.emitter.emit('opened', { fileId: this.id });
  }

  showSelection(selection: editor.ITextEditorSelection) {
    this.editor.setSelection(selection);
    this.editor.revealLine(selection.startLineNumber);
  }

  revertDirty() {
    if (!this.isDirty) {
      return;
    }
    this.isDirty = false;
    this.vsModel.setValue(this.committedText);
    this.emitter.emit('modified', {
      fileId: this.id,
      hasChanges: this.isDirty,
    });
    this.highlight(this.committedText);
  }

  changeFilePath(newPath: string) {
    this.createNewModel(this.vsModel.getValue(), newPath);
  }

  replace(newId: string, newContent: string) {
    if (this.isDirty) {
      this.isDirty = false;
      this.emitter.emit('modified', {
        fileId: this.id,
        hasChanges: this.isDirty,
      });
    }
    this.setHasError(false);
    this.id = newId;
    this.committedText = newContent;
    this.vsModel.setValue(newContent);
    if (this.isOpened) {
      this.isOpened = false;
      this.open();
    }
  }

  ///

  private createNewModel(source: string, path: string) {
    if (this.vsModel) {
      this.vsModel.dispose();
    }
    this.ext = R.last(path.split('.')) ?? '';
    this.vsModel = this.monaco.editor.createModel(
      source,
      _getModelLanguage(path),
      this.monaco.Uri.parse(fixFilePath(path))
    );
    this.committedText = source;
    this.vsModel.onDidChangeContent(() => {
      const original = this.committedText;
      const current = this.vsModel.getValue();
      const hasChanges = original !== current;
      if (this.isDirty !== hasChanges) {
        this.emitter.emit('modified', {
          fileId: this.id,
          hasChanges,
        });
        this.isDirty = hasChanges;
      }
      this.highlight(current);
    });
    this.committedText = source;
    this.highlight(source);
  }

  private highlight(code: string) {
    const version = ++this.highlighVersion;
    void this.highlighter
      .highlight(code, this.ext)
      .then(newDecorations => {
        if (version !== this.highlighVersion) {
          return;
        }
        this.lastHighlighDecorations = this.vsModel.deltaDecorations(
          this.lastHighlighDecorations,
          newDecorations
        );
      })
      .catch(e => {
        console.error('highlight error', e);
      });
  }
}
