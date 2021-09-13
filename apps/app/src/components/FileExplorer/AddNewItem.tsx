import React from 'react';
import { RecTreeNode, TreeNodeType } from 'src/types';
import { ItemPrefixIcons } from './ItemPrefixIcons';
import { NameInput } from './NameInput';
import { checkDuplicated } from './utils';

interface AddNewItemProps {
  folderItems: RecTreeNode[];
  nestedLevel: number;
  type: TreeNodeType;
  onNewAdded: (type: TreeNodeType, name: string) => void;
  onNewCancelled: () => void;
}

export function AddNewItem(props: AddNewItemProps) {
  const { type, onNewAdded, onNewCancelled, nestedLevel, folderItems } = props;
  const [value, setValue] = React.useState('');
  const commit = () => {
    const name = value.trim();
    if (name) {
      if (
        !checkDuplicated({
          type,
          items: folderItems,
          name,
        })
      ) {
        onNewAdded(type, name);
      }
    } else {
      onNewCancelled();
    }
  };
  return (
    <div
      style={{
        paddingLeft: nestedLevel + 'rem',
      }}
      tw="flex items-center text-gray-300 select-none focus:outline-none border border-transparent bg-indigo-700 h-6"
    >
      <ItemPrefixIcons type={type} name={value} />
      <NameInput
        value={value}
        onChange={e => setValue(e.target.value)}
        autoFocus
        type="text"
        onKeyDown={e => {
          if (e.key === 'Enter') {
            commit();
          }
          if (e.key === 'Escape') {
            onNewCancelled();
          }
          e.stopPropagation();
        }}
        onBlur={commit}
      />
    </div>
  );
}
