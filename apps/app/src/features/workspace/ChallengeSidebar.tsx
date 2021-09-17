import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Place } from 'react-tooltip';
import tw from 'twin.macro';
import { Tooltip } from '../../components/Tooltip';

interface SidebarItem<T> {
  name: T;
  label: string;
  fa?: IconDefinition;
  customIcon?: React.ReactNode;
  current: boolean;
}

interface ChallengeSidebarProps<T> {
  items: SidebarItem<T>[];
  onSelect: (name: T) => void;
  tooltipPlace?: Place;
}

export function ChallengeSidebar<T extends string>(
  props: ChallengeSidebarProps<T>
) {
  const { items, onSelect, tooltipPlace } = props;
  return (
    <nav aria-label="Sidebar" tw="flex-shrink-0 bg-gray-800 overflow-y-auto">
      <div tw="relative flex flex-col p-2 space-y-3">
        {items.filter(Boolean).map(item => (
          <Tooltip place={tooltipPlace} key={item.name} tooltip={item.label}>
            <button
              className="group"
              css={[
                item.current
                  ? tw`bg-gray-900 text-white`
                  : tw`text-gray-400 hover:bg-gray-700`,
                tw`flex-shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-lg`,
                tw`focus:( outline-none ring-1 ring-gray-700)`,
              ]}
              onClick={() => {
                onSelect(item.name);
              }}
            >
              <span tw="sr-only">{item.label}</span>
              {item.fa && (
                <FontAwesomeIcon
                  className="h-6 w-6"
                  aria-hidden="true"
                  icon={item.fa}
                />
              )}
              {item.customIcon}
            </button>
          </Tooltip>
        ))}
      </div>
    </nav>
  );
}
