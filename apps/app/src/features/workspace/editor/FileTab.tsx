import React from 'react';
import tw from 'twin.macro';
import { FileIcon } from '../../../components/FileExplorer/icons/FileIcon';
import { CloseIcon } from '../../../icons/CloseIcon';
import { IndicatorIcon } from '../../../icons/IndicatorIcon';

interface FileTabProps {
  name: string;
  isActive?: boolean;
  hasChanges?: boolean;
  hasError?: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export function FileTab(props: FileTabProps) {
  const { name, isActive, hasChanges, onClose, onOpen, hasError } = props;
  return (
    <div className="group">
      <div
        tw="h-9 text-gray-300 text-sm px-3 py-2 bg-gray-800  border-b border-transparent inline-flex items-center cursor-pointer pr-10 relative opacity-60"
        css={[isActive && tw`bg-gray-800 opacity-100 border-indigo-500`]}
        onClick={() => {
          if (!isActive) {
            onOpen();
          }
        }}
        onMouseUp={e => {
          if (e.button === 1) {
            onClose();
          }
        }}
      >
        <div tw="w-4 h-4 mr-2">
          <FileIcon name={name} />
        </div>
        <span css={[hasError && tw`text-red-500`]}>{name}</span>

        <button
          tw="focus:outline-none hover:text-white absolute right-3 top-0 bottom-0 items-center transform justify-center leading-none hidden group-hover:flex"
          css={[(hasChanges || isActive) && tw`flex`]}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            if (hasChanges) {
              if (
                !confirm(
                  'Are you sure you want to close this tab? You will lose unsaved changes.'
                )
              ) {
                return;
              }
            }
            onClose();
          }}
        >
          <CloseIcon css={[hasChanges && tw`hidden group-hover:block`]} />
          {hasChanges && <IndicatorIcon tw="group-hover:hidden" />}
        </button>
      </div>
    </div>
  );
}
