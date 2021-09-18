import { useRouter } from 'next/dist/client/router';
import React from 'react';
import { createUrl } from 'src/common/url';
import { api } from 'src/services/api';
import tw from 'twin.macro';
import { useErrorModalActions } from '../ErrorModalModule';

interface TemplateItemProps {
  id: string;
  icon: React.ReactNode;
  name: string;
}

export function TemplateItem(props: TemplateItemProps) {
  const { id, icon, name } = props;
  const [isLoading, setIsLoading] = React.useState(false);
  const { showError } = useErrorModalActions();
  const router = useRouter();
  return (
    <li>
      <div tw="block   bg-gray-900 py-3">
        <div tw="px-4 py-4 sm:px-6">
          <div tw="flex items-center justify-between">
            <div tw="flex items-center space-x-3">
              <div tw="text-4xl">{icon}</div>
              <p tw="text-xl tracking-tight font-medium text-gray-200 truncate">
                {name}
              </p>
            </div>
            <button
              disabled={isLoading}
              tw="inline-flex items-center px-4 py-1 border border-transparent text-base font-medium rounded-md text-gray-700 bg-indigo-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              css={[isLoading && tw`bg-gray-500! text-gray-200!`]}
              onClick={async () => {
                setIsLoading(true);
                try {
                  const ret = await api.workspace_createWorkspace(id);
                  await router.push(
                    createUrl({ name: 'workspace', id: ret.id })
                  );
                } catch (e) {
                  showError(e);
                  setIsLoading(false);
                }
              }}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
