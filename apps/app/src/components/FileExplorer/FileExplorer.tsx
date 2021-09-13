import { createModuleContext, useActions, useImmer } from 'context-api';
import * as R from 'remeda';
import * as uuid from 'uuid';
import React from 'react';
import { ActionIcon } from './ActionIcon';
import { FileExplorerItemList } from './FileExplorerItemList';
import { NewDirectoryIcon } from './icons/NewDirectoryIcon';
import { NewFileIcon } from './icons/NewFileIcon';
import { doFn } from '../../common/helper';
import { TreeNode, TreeNodeType } from 'src/types';
import { FileTreeHelper, getVisibleNodes } from 'src/common/tree';
import tw from 'twin.macro';

interface FileExplorerProps {
  nodeState: Record<string, 'error'>;
  lockedNodesMap: Record<string, boolean>;
  items: TreeNode[];
  onOpenFile: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onNewFile: (node: TreeNode) => void;
  onRemoved: (id: string) => void;
  isReadOnly?: boolean;
}

interface BaseState {
  hasFocus: boolean;
  activeItemId: string | null;
  navigationActiveItemId: string | null;
  expandedDirectories: Record<string, boolean>;
}

interface State extends BaseState {
  nodeState: Record<string, 'error'>;
  lockedNodesMap: Record<string, boolean>;
  isReadOnly?: boolean;
}

interface ItemAPI {
  rename: () => void;
  confirmDelete: () => void;
}

interface Actions {
  toggleDirectoryExpanded: (id: string) => void;
  setActive: (id: string) => void;
  removeItem: (id: string) => void;
  updateItemName: (id: string, name: string) => void;
  addNew: (type: TreeNodeType, name: string, parentId: string | null) => void;
  registerItem: (id: string, api: ItemAPI | null) => void;
  openFile: (id: string) => void;
}

const [Provider, useContext] = createModuleContext<State, Actions>();

export function FileExplorer(props: FileExplorerProps) {
  const {
    onOpenFile,
    onNewFile,
    onRemoved,
    onRename,
    items,
    lockedNodesMap,
    nodeState,
    isReadOnly,
  } = props;
  const [state, setState] = useImmer<BaseState>({
    hasFocus: false,
    activeItemId: null,
    navigationActiveItemId: null,
    expandedDirectories: {},
  });
  const wrapperRef = React.useRef<HTMLDivElement>(null!);
  const itemApiRef = React.useRef<Record<string, ItemAPI>>({});
  const [isAdding, setIsAdding] = React.useState<TreeNodeType | null>(null);
  const { activeItemId, navigationActiveItemId, expandedDirectories } = state;
  const actions = useActions<Actions>({
    registerItem: (id, api) => {
      if (api) {
        itemApiRef.current[id] = api;
      } else {
        delete itemApiRef.current[id];
      }
    },
    toggleDirectoryExpanded: id => {
      setState(draft => {
        if (draft.expandedDirectories[id]) {
          delete draft.expandedDirectories[id];
        } else {
          draft.expandedDirectories[id] = true;
        }
      });
    },
    setActive: id => {
      setState(draft => {
        draft.activeItemId = id;
      });
    },
    addNew: (type, name, parentId) => {
      const id = uuid.v4();
      onNewFile({
        id,
        name,
        parentId,
        type,
      });
    },
    removeItem: id => {
      onRemoved(id);
    },
    updateItemName: (id, name) => {
      setState(draft => {
        draft.activeItemId = id;
        draft.navigationActiveItemId = id;
      });
      onRename(id, name);
    },
    openFile: id => {
      onOpenFile(id);
    },
  });
  const recNodes = React.useMemo(() => {
    return new FileTreeHelper(items).buildRecTree();
  }, [items]);
  const itemMap = React.useMemo(() => {
    return R.indexBy(items, x => x.id);
  }, [items]);
  const displayList = React.useMemo(() => {
    return getVisibleNodes(recNodes, expandedDirectories);
  }, [recNodes, expandedDirectories]);

  return (
    <Provider
      state={{ ...state, lockedNodesMap, nodeState, isReadOnly }}
      actions={actions}
    >
      <div
        ref={wrapperRef}
        tw="text-sm text-gray-400"
        onFocus={() => {
          setState(draft => {
            draft.hasFocus = true;
          });
        }}
        onBlur={() => {
          setState(draft => {
            draft.hasFocus = false;
            draft.navigationActiveItemId = null;
          });
        }}
        onKeyDown={e => {
          const shouldPrevent = doFn(() => {
            switch (e.key) {
              case 'ArrowRight': {
                if (!navigationActiveItemId) {
                  return true;
                }
                const item = itemMap[navigationActiveItemId];
                if (item.type === 'directory') {
                  setState(draft => {
                    draft.expandedDirectories[navigationActiveItemId] = true;
                  });
                } else {
                  actions.openFile(item.id);
                  setState(draft => {
                    draft.activeItemId = navigationActiveItemId;
                    draft.navigationActiveItemId = null;
                  });
                }
                return true;
              }
              case 'ArrowLeft': {
                if (!navigationActiveItemId) {
                  return true;
                }
                const item = itemMap[navigationActiveItemId];
                if (item.type === 'directory') {
                  setState(draft => {
                    delete draft.expandedDirectories[navigationActiveItemId];
                  });
                }
                return true;
              }
              case 'ArrowUp':
              case 'ArrowDown': {
                if (!navigationActiveItemId && !activeItemId) {
                  setState(draft => {
                    draft.navigationActiveItemId = displayList[0]?.id;
                  });
                  return true;
                }
                const idx =
                  displayList.findIndex(
                    item => item.id === (navigationActiveItemId ?? activeItemId)
                  ) + (e.key === 'ArrowDown' ? 1 : -1);
                if (displayList[idx]) {
                  setState(draft => {
                    draft.navigationActiveItemId = displayList[idx].id;
                  });
                }
                return true;
              }
              case 'Enter': {
                if (isReadOnly) {
                  return;
                }
                const id = navigationActiveItemId || activeItemId;
                if (id) {
                  itemApiRef.current[id]?.rename();
                }
                return true;
              }
              case 'Delete': {
                if (isReadOnly) {
                  return;
                }
                const id = navigationActiveItemId || activeItemId;
                if (id) {
                  itemApiRef.current[id]?.confirmDelete();
                }
                return true;
              }
            }
            return false;
          });
          if (shouldPrevent) {
            e.preventDefault();
          }
        }}
      >
        <div tw="flex">
          <div tw="text-xs font-semibold tracking-wider mb-1 ">FILES</div>
          <div tw="ml-auto space-x-2" css={[isReadOnly && tw`invisible`]}>
            <ActionIcon
              title="New File"
              onClick={() => {
                setIsAdding('file');
              }}
            >
              <NewFileIcon />
            </ActionIcon>
            <ActionIcon
              title="New Directory"
              onClick={() => {
                setIsAdding('directory');
              }}
            >
              <NewDirectoryIcon />
            </ActionIcon>
          </div>
        </div>
        <div tw="-mx-3">
          <FileExplorerItemList
            isAdding={isAdding}
            onNewAdded={(type, name) => {
              actions.addNew(type, name, null);
              setIsAdding(null);
            }}
            onNewCancelled={() => {
              setIsAdding(null);
            }}
            nestedLevel={0}
            items={recNodes}
          />
        </div>
      </div>
    </Provider>
  );
}

export function useFileExplorerActions() {
  return useContext().actions;
}

export function useFileExplorerState() {
  return useContext().state;
}
