import React from 'react';
import { TreeNodeType } from 'src/types';
import { ExpandedIcon } from './icons/ExpandedIcon';
import { FileIcon } from './icons/FileIcon';
import { FolderIcon } from './icons/FolderIcon';

interface ItemPrefixIconsProps {
  type: TreeNodeType;
  name: string;
  isExpanded?: boolean;
}

export function ItemPrefixIcons(props: ItemPrefixIconsProps) {
  const { type, name, isExpanded } = props;
  return (
    <div tw="flex">
      {type === 'directory' && (
        <>
          <div tw="h-4 w-4">
            <ExpandedIcon isExpanded={isExpanded ?? false} />
          </div>
          <div tw="w-4 h-4 mr-1">
            <FolderIcon isOpen={isExpanded ?? false} />
          </div>
        </>
      )}
      {type === 'file' && (
        <>
          <div tw="w-4 h-4 mr-1 ml-4">
            <FileIcon name={name} />
          </div>
        </>
      )}
    </div>
  );
}
