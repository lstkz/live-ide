import * as R from 'remeda';
import { doFn } from '../lib/helper';
import { ModelState, ModelStateUpdater } from '../lib/ModelState';
import { FileTreeHelper, findFileByPath } from '../lib/tree';
import { TypedEventEmitter } from '../lib/TypedEventEmitter';
import { BundlerService } from '../services/BundlerService';
import { EditorStateService } from '../services/EditorStateService';
import {
  CodeActionsCallbackMap,
  FileNode,
  IAPIService,
  InitWorkspaceOptions,
  TreeNode,
  WorkspaceState,
} from '../types';
import { CodeEditorModel } from './CodeEditorModel';
import { ModelCollection } from './ModelCollection';

function getDefaultState(): WorkspaceState {
  return {
    activeTabId: null,
    tabs: [],
    dirtyMap: {},
    nodes: [],
    nodeState: {},
  };
}

function randomHash() {
  return R.randomString(15);
}

const TODO_INPUT_FILE = './index.tsx';

export class WorkspaceModel {
  private modelState: ModelState<WorkspaceState> = null!;
  private fileHashMap: Map<string, string> = new Map();
  private options: InitWorkspaceOptions = null!;
  private hasAttachedEvents = false;

  constructor(
    private codeEditorModel: CodeEditorModel,
    private emitter: TypedEventEmitter<CodeActionsCallbackMap>,
    private apiService: IAPIService,
    private editorStateService: EditorStateService,
    private bundlerService: BundlerService,
    private modelCollection: ModelCollection
  ) {
    this.modelState = new ModelState(getDefaultState(), 'WorkspaceModelNext');
  }

  async init(options: InitWorkspaceOptions) {
    this.options = options;
    const { defaultOpenFiles, fileHashMap, nodes, readOnly } = options;
    const tabsState = readOnly
      ? {
          activeTabId: null,
          tabs: [],
        }
      : this.editorStateService.loadTabsState();
    this.fileHashMap = fileHashMap;
    const nodeMap = R.indexBy(nodes, x => x.id);
    tabsState.tabs = tabsState.tabs.filter(x => nodeMap[x.id]);
    if (tabsState.activeTabId && !nodeMap[tabsState.activeTabId]) {
      tabsState.activeTabId = null;
    }
    const pathHelper = new FileTreeHelper(nodes);
    if (!tabsState.tabs.length && defaultOpenFiles.length) {
      const tree = pathHelper.buildRecTree();
      const tabs = defaultOpenFiles
        .map(path => findFileByPath(tree, path))
        .map(node => ({
          id: node.id,
          name: node.name,
        }));
      tabsState.tabs = tabs;
    }
    if (!tabsState.activeTabId && tabsState.tabs.length) {
      tabsState.activeTabId = tabsState.tabs[0].id;
    }
    this.setState(draft => {
      draft.activeTabId = tabsState.activeTabId;
      draft.tabs = tabsState.tabs;
      draft.nodes = nodes;
    });
    const fileNodes = await Promise.all(
      nodes
        .filter(node => node.type === 'file')
        .map(async node => {
          node = node as FileNode;
          return {
            id: node.id,
            path: pathHelper.getPath(node.id),
            source: await this.apiService.getFileContent(
              node.contentUrl!,
              this.fileHashMap.get(node.id)
            ),
          };
        })
    );
    this.modelCollection.replaceFiles(fileNodes);
    if (tabsState.activeTabId) {
      this.modelCollection.openFile(tabsState.activeTabId);
    }
    this.attachEvents();
    this.loadCode();
    this.setReadOnly(options.readOnly ?? false);
  }

  public getModelState() {
    return this.modelState;
  }

  protected get state() {
    return this.modelState.state;
  }

  protected setState(updater: ModelStateUpdater<WorkspaceState>) {
    this.modelState.update(updater);
  }

  openFile(id: string) {
    this.openTab(id);
    this.modelCollection.openFile(id);
    this.syncTabs();
  }

  closeFile(id: string) {
    let newActiveId: string | null | -1 = -1;
    this.setState(draft => {
      draft.tabs = draft.tabs.filter(x => x.id !== id);
      if (draft.activeTabId === id) {
        draft.activeTabId = draft.tabs[0]?.id ?? null;
        newActiveId = draft.activeTabId;
      }
    });
    if (newActiveId !== -1) {
      this.modelCollection.openFile(newActiveId);
    }
    this.modelCollection.revertDirty(id);
    this.syncTabs();
  }

  async removeNode(nodeId: string) {
    void this.apiService.deleteNode(nodeId);
    const node = this.getNodeById(nodeId);
    const nodesToRemove = doFn(() => {
      if (node.type === 'directory') {
        const treeHelper = new FileTreeHelper(this.state.nodes);
        return treeHelper.flattenDirectory(nodeId);
      }
      return [node];
    });
    nodesToRemove.forEach(node => {
      if (node.type === 'file') {
        this.modelCollection.removeFile(node.id);
      }
    });
    const removedMap = R.indexBy(nodesToRemove, x => x.id);
    this.setState(draft => {
      if (draft.activeTabId && removedMap[draft.activeTabId]) {
        draft.activeTabId = null;
      }
      draft.tabs = draft.tabs.filter(x => !removedMap[x.id]);
      if (!draft.activeTabId && draft.tabs.length) {
        draft.activeTabId = draft.tabs[0].id;
      }
      draft.nodes = draft.nodes.filter(x => !removedMap[x.id]);
    });
    this.modelCollection.openFile(this.state.activeTabId);
    this.syncTabs();
    this.loadCode();
  }

  async renameNode(nodeId: string, name: string) {
    void this.apiService.updateNode({ id: nodeId, name });
    this.setState(draft => {
      draft.nodes.forEach(item => {
        if (item.id === nodeId) {
          item.name = name;
        }
      });
      draft.tabs.forEach(item => {
        if (item.id === nodeId) {
          item.name = name;
        }
      });
    });
    const treeHelper = new FileTreeHelper(this.state.nodes);
    const renameNodes = treeHelper.flattenDirectory(nodeId);
    renameNodes.forEach(node => {
      if (node.type === 'file') {
        this.modelCollection.changeFilePath(
          node.id,
          treeHelper.getPath(node.id)
        );
      }
    });
    this.loadCode();
  }

  addNew(newNode: TreeNode) {
    const nodeId = newNode.id;
    const hash = randomHash();
    this.fileHashMap.set(nodeId, hash);
    void this.apiService.addNode({
      ...newNode,
      workspaceId: this.options.workspaceId,
      hash,
    });
    this.setState(draft => {
      draft.nodes.push(newNode);
    });
    if (newNode.type === 'directory') {
      return;
    }
    const pathHelper = new FileTreeHelper(this.state.nodes);
    this.modelCollection.addFile({
      id: nodeId,
      path: pathHelper.getPath(nodeId),
      source: '',
    });
    this.openFile(nodeId);
    requestAnimationFrame(() => {
      this.codeEditorModel.focus();
    });
  }

  dispose() {}

  setReadOnly(readOnly: boolean) {
    this.codeEditorModel.setReadOnly(readOnly);
  }

  getBundledCode() {
    return this.bundlerService.loadCodeAsync(this.getLoadCodeOptions());
  }

  ///

  private attachEvents() {
    if (this.hasAttachedEvents) {
      return;
    }
    this.hasAttachedEvents = true;
    this.emitter.addEventListener('modified', ({ fileId, hasChanges }) => {
      this.setState(draft => {
        if (hasChanges) {
          draft.dirtyMap[fileId] = hasChanges;
        } else {
          delete draft.dirtyMap[fileId];
        }
      });
    });
    this.emitter.addEventListener('saved', ({ fileId, content }) => {
      this.setState(draft => {
        delete draft.dirtyMap[fileId];
      });
      const newHash = randomHash();
      void this.apiService.updateNode({
        id: fileId,
        content,
        hash: newHash,
      });
      this.fileHashMap.set(fileId, newHash);
      this.loadCode();
    });
    this.emitter.addEventListener('opened', ({ fileId }) => {
      this.openTab(fileId);
      this.syncTabs();
    });
    this.emitter.addEventListener('errorsChanged', ({ diffErrorMap }) => {
      this.setState(draft => {
        Object.keys(diffErrorMap).forEach(fileId => {
          if (diffErrorMap[fileId]) {
            draft.nodeState[fileId] = 'error';
          } else {
            delete draft.nodeState[fileId];
          }
        });
      });
    });
  }

  private getNodeById(id: string) {
    const { nodes } = this.state;
    return nodes.find(x => x.id === id)!;
  }

  private openTab(id: string) {
    const file = this.getNodeById(id);
    this.setState(draft => {
      draft.activeTabId = id;
      if (!draft.tabs.some(x => x.id === id)) {
        draft.tabs.push({
          id: id,
          name: file.name,
        });
      }
    });
  }

  private loadCode() {
    this.bundlerService.init();
    this.bundlerService.loadCode(this.getLoadCodeOptions());
  }

  private getLoadCodeOptions() {
    return {
      fileMap: this.modelCollection.getFileMap(),
      inputFile: TODO_INPUT_FILE,
    };
  }

  private syncTabs() {
    if (this.options.readOnly) {
      return;
    }
    const { activeTabId, tabs } = this.state;
    this.editorStateService.updateTabsState({
      activeTabId,
      tabs,
    });
  }
}
