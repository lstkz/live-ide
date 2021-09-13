import type { editor } from 'monaco-editor';
import { EditorFactory } from './EditorFactory';
import { TypedEventEmitter } from './lib/TypedEventEmitter';
import { CodeEditorModel } from './models/CodeEditorModel';
import { ModelCollection } from './models/ModelCollection';
import { WorkspaceModel } from './models/WorkspaceModel';
import { BrowserPreviewService } from './services/BrowserPreviewService';
import { BundlerService } from './services/BundlerService';
import { EditorStateService } from './services/EditorStateService';
import { FormatterService } from './services/FormatterService';
import { HighlighterService } from './services/HighlighterService';
import { ThemeService } from './services/ThemeService';
import { CodeActionsCallbackMap, IAPIService, Monaco } from './types';

export class EditorCreator {
  bundlerService: BundlerService;
  emitter: TypedEventEmitter<CodeActionsCallbackMap>;
  formatterService: FormatterService;
  themeService: ThemeService;
  highlighterService: HighlighterService;
  modelCollection: ModelCollection;
  codeEditorModel: CodeEditorModel;
  workspaceModel: WorkspaceModel;
  editorFactory: EditorFactory;

  constructor(
    public apiService: IAPIService,
    public browserPreviewService: BrowserPreviewService,
    public editorStateService: EditorStateService
  ) {
    this.bundlerService = new BundlerService(browserPreviewService);
    this.emitter = new TypedEventEmitter<CodeActionsCallbackMap>();
    this.formatterService = new FormatterService();
    this.themeService = new ThemeService();
    this.highlighterService = new HighlighterService(this.themeService);
    this.modelCollection = new ModelCollection(
      this.emitter,
      this.highlighterService
    );
    this.codeEditorModel = new CodeEditorModel(
      this.formatterService,
      this.modelCollection
    );
    this.workspaceModel = new WorkspaceModel(
      this.codeEditorModel,
      this.emitter,
      this.apiService,
      this.editorStateService,
      this.bundlerService,
      this.modelCollection
    );
    this.editorFactory = new EditorFactory();
  }

  init(monaco: Monaco, editor: editor.IStandaloneCodeEditor) {
    this.bundlerService.init();
    this.formatterService.init();
    this.highlighterService.init(monaco);
    this.modelCollection.init(monaco, editor);
    this.codeEditorModel.init(monaco, editor);
  }

  dispose() {
    this.bundlerService.dispose();
    this.emitter.dispose();
    this.formatterService.dispose();
    this.themeService.dispose();
    this.highlighterService.dispose();
    this.modelCollection.dispose();
    this.codeEditorModel.dispose();
    this.workspaceModel.dispose();
  }
}
