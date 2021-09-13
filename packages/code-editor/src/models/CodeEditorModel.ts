import type { editor } from 'monaco-editor';
import { Monaco } from '../types';
import { ModelCollection } from './ModelCollection';
import { FormatterService } from '../services/FormatterService';

export class CodeEditorModel {
  private monaco: Monaco = null!;
  private editor: editor.IStandaloneCodeEditor = null!;
  private isInited = false;

  constructor(
    private formatter: FormatterService,
    private collection: ModelCollection
  ) {}

  init(monaco: Monaco, editor: editor.IStandaloneCodeEditor) {
    if (this.isInited) {
      return;
    }
    this.isInited = true;
    this.monaco = monaco;
    this.editor = editor;
    this.monaco.languages.registerDocumentFormattingEditProvider('typescript', {
      provideDocumentFormattingEdits: async model => {
        return [
          {
            text: await this.formatter.formatCode(
              'typescript',
              model.getValue()
            ),
            range: model.getFullModelRange(),
          },
        ];
      },
    });
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
      if (this.editor.getRawOptions().readOnly) {
        return;
      }
      void this.collection.save();
    });

    const codeEditorService = this.editor._codeEditorService;
    const openEditorBase =
      codeEditorService.openCodeEditor.bind(codeEditorService);
    codeEditorService.openCodeEditor = async (input, source) => {
      const result = await openEditorBase(input, source);
      if (result) {
        return result;
      }
      this.collection.openFile(input);
      return null;
    };
  }

  focus() {
    this.editor.focus();
  }

  dispose() {
    this.editor?.dispose();
  }

  setReadOnly(readOnly: boolean) {
    this.editor.updateOptions({ readOnly });
  }
}
