import React from 'react';
import { Logo } from '../../components/Logo';
import { createUrl } from 'src/common/url';
import tw from 'twin.macro';
import { ParticipantList } from './ParticipantList';

export function WorkspaceHeader() {
  return (
    <div tw="bg-gray-800 h-10 flex items-center px-2 flex-shrink-0">
      <Logo
        imgCss={tw`h-5 w-auto`}
        href={createUrl({
          name: 'home',
        })}
      />
      <ParticipantList />
    </div>
  );
}
