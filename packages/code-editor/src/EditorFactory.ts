import { Monaco } from './types';
import type { editor } from 'monaco-editor';

export function createEditor(monaco: Monaco, wrapper: HTMLDivElement) {
  monaco.editor.defineTheme('myCustomTheme', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#011627',
    },
  });
  const properties: editor.IStandaloneEditorConstructionOptions = {
    language: 'typescript',
    theme: 'myCustomTheme',
    model: null,
    minimap: {
      enabled: false,
    },
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true,
    },
    automaticLayout: true,
  };
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    esModuleInterop: true,
    strict: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    isolatedModules: true,
    typeRoots: ['node_modules/@types'],
  });
  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    // noSemanticValidation: false,
    // noSyntaxValidation: false,
  });

  const editor = monaco.editor.create(wrapper, properties, {});

  return editor;
}

export class EditorFactory {
  private editor: editor.IStandaloneCodeEditor = null!;
  private monaco: Monaco = null!;
  private wrapper: HTMLDivElement = null!;

  init(monaco: Monaco, wrapper: HTMLDivElement) {
    this.monaco = monaco;
    this.wrapper = wrapper;
  }

  create() {
    if (!this.editor) {
      this.editor = createEditor(this.monaco, this.wrapper);
    }
    return this.editor;
  }
}
