import React from 'react';
import { Logo } from '../../components/Logo';
import { createUrl } from 'src/common/url';
import tw, { styled } from 'twin.macro';
import { ParticipantList } from './ParticipantList';
import { useLayoutEffectFix } from 'src/hooks/useLayoutEffectFix';
import { GitHubButton } from 'src/components/GitHubButton';

const ButtonWrapper = styled.div`
  span {
    ${tw`flex items-center `}
  }
`;

export function WorkspaceHeader() {
  const [loaded, setLoaded] = React.useState(false);
  useLayoutEffectFix(() => {
    setLoaded(true);
  });
  return (
    <div tw="bg-gray-800 h-10 flex items-center px-2 flex-shrink-0">
      <div tw="flex items-center space-x-4">
        <Logo
          imgCss={tw`h-5 w-auto`}
          href={createUrl({
            name: 'home',
          })}
        />
        {loaded && (
          <ButtonWrapper>
            <GitHubButton />
          </ButtonWrapper>
        )}
      </div>
      <ParticipantList />
    </div>
  );
}
