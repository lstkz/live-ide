/* eslint-disable @typescript-eslint/no-namespace */
import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { editor as editorBase } from 'monaco-editor';

export enum MarkerSeverity {
  Hint = 1,
  Info = 2,
  Warning = 4,
  Error = 8,
}

declare module 'monaco-editor' {
  export namespace editor {
    export interface StandaloneKeybindingService {
      // from: https://github.com/microsoft/vscode/blob/df6d78a/src/vs/editor/standalone/browser/simpleServices.ts#L337
      // Passing undefined with `-` prefixing the commandId, will unset the existing keybinding.
      // eg `addDynamicKeybinding('-fooCommand', undefined, () => {})`
      // this is technically not defined in the source types, but still works. We can't pass `0`
      // because then the underlying method exits early.
      // See: https://github.com/microsoft/vscode/blob/df6d78a/src/vs/base/common/keyCodes.ts#L414
      addDynamicKeybinding(
        commandId: string,
        keybinding: number | undefined,
        handler: editorBase.ICommandHandler,
        when?: any // ContextKeyExpression
      ): IDisposable;
    }

    export interface ICodeEditor {
      _standaloneKeybindingService: StandaloneKeybindingService;
      _codeEditorService: ICodeEditorService;
    }

    export interface ICodeEditorService {
      openCodeEditor(
        input: ITextResourceEditorInput,
        source: ICodeEditor | null,
        sideBySide?: boolean
      ): Promise<ICodeEditor | null>;
    }
    export interface IBaseResourceEditorInput {
      /**
       * Optional options to use when opening the input.
       */
      options?: IEditorOptions;

      /**
       * Label to show for the input.
       */
      readonly label?: string;

      /**
       * Description to show for the input.
       */
      readonly description?: string;

      /**
       * Hint to indicate that this input should be treated as a file
       * that opens in an editor capable of showing file content.
       *
       * Without this hint, the editor service will make a guess by
       * looking at the scheme of the resource(s).
       */
      readonly forceFile?: boolean;

      /**
       * Hint to indicate that this input should be treated as a
       * untitled file.
       *
       * Without this hint, the editor service will make a guess by
       * looking at the scheme of the resource(s).
       */
      readonly forceUntitled?: boolean;
    }
    export interface IResourceEditorInput extends IBaseResourceEditorInput {
      /**
       * The resource URI of the resource to open.
       */
      readonly resource: monacoEditor.Uri;
    }
    export interface ITextResourceEditorInput
      extends IResourceEditorInput,
        IBaseTextResourceEditorInput {
      /**
       * Optional options to use when opening the text input.
       */
      options?: ITextEditorOptions;
    }
    export interface ITextEditorOptions extends IEditorOptions {
      /**
       * Text editor selection.
       */
      selection?: ITextEditorSelection;

      /**
       * Text editor view state.
       */
      viewState?: object;

      /**
       * Option to control the text editor selection reveal type.
       * Defaults to TextEditorSelectionRevealType.Center
       */
      selectionRevealType?: TextEditorSelectionRevealType;
    }

    export const enum TextEditorSelectionRevealType {
      /**
       * Option to scroll vertically or horizontally as necessary and reveal a range centered vertically.
       */
      Center = 0,

      /**
       * Option to scroll vertically or horizontally as necessary and reveal a range centered vertically only if it lies outside the viewport.
       */
      CenterIfOutsideViewport = 1,

      /**
       * Option to scroll vertically or horizontally as necessary and reveal a range close to the top of the viewport, but not quite at the top.
       */
      NearTop = 2,

      /**
       * Option to scroll vertically or horizontally as necessary and reveal a range close to the top of the viewport, but not quite at the top.
       * Only if it lies outside the viewport
       */
      NearTopIfOutsideViewport = 3,
    }
    export interface ITextEditorSelection {
      readonly startLineNumber: number;
      readonly startColumn: number;
      readonly endLineNumber: number;
      readonly endColumn: number;
    }

    export interface IBaseTextResourceEditorInput
      extends IBaseResourceEditorInput {
      /**
       * Optional options to use when opening the text input.
       */
      options?: ITextEditorOptions;

      /**
       * The contents of the text input if known. If provided,
       * the input will not attempt to load the contents from
       * disk and may appear dirty.
       */
      contents?: string;

      /**
       * The encoding of the text input if known.
       */
      encoding?: string;

      /**
       * The identifier of the language mode of the text input
       * if known to use when displaying the contents.
       */
      mode?: string;
    }
  }
}

export {};
