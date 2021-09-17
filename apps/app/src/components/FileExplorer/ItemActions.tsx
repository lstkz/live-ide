import React from 'react';
import { CSSProp } from 'styled-components';
import { ActionIcon } from './ActionIcon';
import { useFileExplorerActions, useFileExplorerState } from './FileExplorer';
import { EditIcon } from './icons/EditIcon';
import { NewDirectoryIcon } from './icons/NewDirectoryIcon';
import { TrashIcon } from './icons/TrashIcon';
import { NewFileIcon } from './icons/NewFileIcon';
import { RecTreeNode, TreeNodeType } from 'src/types';
import { LockClosedIcon } from '@heroicons/react/outline';

interface ItemActionsProps {
  locked?: boolean;
  css?: CSSProp;
  className?: string;
  item: RecTreeNode;
  setIsAdding: (type: TreeNodeType) => void;
  onEdit: () => void;
}

export function confirmItemDelete(item: RecTreeNode) {
  return confirm(`Are you sure you want to delete "${item.name}"?`);
}

export function ItemActions(props: ItemActionsProps) {
  const { item, className, setIsAdding, onEdit, locked } = props;
  const { toggleDirectoryExpanded, removeItem } = useFileExplorerActions();
  const { expandedDirectories } = useFileExplorerState();
  const isExpanded = expandedDirectories[item.id];

  const directoryIcons = (
    <>
      <ActionIcon
        title="New File"
        onClick={() => {
          if (!isExpanded) {
            toggleDirectoryExpanded(item.id);
          }
          setIsAdding('file');
        }}
      >
        <NewFileIcon />
      </ActionIcon>
      <ActionIcon
        title="New Directory"
        onClick={() => {
          if (!isExpanded) {
            toggleDirectoryExpanded(item.id);
          }
          setIsAdding('directory');
        }}
      >
        <NewDirectoryIcon />
      </ActionIcon>
    </>
  );

  const commonIcons = (
    <>
      <ActionIcon title="Edit" onClick={onEdit}>
        <EditIcon />
      </ActionIcon>
      <ActionIcon
        title="Delete"
        onClick={() => {
          if (confirmItemDelete(item)) {
            removeItem(item.id);
          }
        }}
      >
        <TrashIcon />
      </ActionIcon>
    </>
  );

  return (
    <div
      tw="absolute right-0 top-0 bottom-0 text-gray-400 hidden group-hover:flex items-center px-2 space-x-1 bg-gray-800"
      className={className}
      onClick={e => {
        e.stopPropagation();
      }}
    >
      {locked ? (
        <>
          <ActionIcon title="Locked" disabled>
            <LockClosedIcon tw=" w-4 h-4" />
          </ActionIcon>
        </>
      ) : (
        <>
          {item.type === 'directory' && directoryIcons}
          {commonIcons}
        </>
      )}
    </div>
  );
}
