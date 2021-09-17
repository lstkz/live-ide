import {
  ArrowLeftIcon,
  ArrowRightIcon,
  RefreshIcon,
} from '@heroicons/react/solid';
import * as R from 'remeda';
import { createModuleContext, useActions, useImmer } from 'context-api';
import React from 'react';
import {
  IframeNavigationCallbackMessage,
  IframeNavigationMessage,
} from 'shared';
import tw, { styled } from 'twin.macro';

interface WebNavigatorProps {
  name: string;
  children: React.ReactNode;
  origin: string;
  shallowHidden: boolean;
}

const IconButton = styled.button`
  ${tw`h-6 w-6 text-gray-500 p-0.5 rounded-sm flex-shrink-0`}
  ${props =>
    props.disabled
      ? tw`cursor-default text-gray-300`
      : tw`hover:( cursor-pointer bg-gray-200 ) focus:(outline-none ring-1 ring-gray-400)`}
`;

interface Actions {
  registerIframe: (iframe: HTMLIFrameElement) => void;
}
interface State {
  urlHistory: string[];
  historyIdx: number;
}

const [Provider, useContext] = createModuleContext<State, Actions>();

export function WebNavigator(props: WebNavigatorProps) {
  const { children, shallowHidden, name } = props;
  const iframeRef = React.useRef(null! as HTMLIFrameElement);
  const urlInputRef = React.useRef(null! as HTMLInputElement);
  const [state, setState, getState] = useImmer<State>(
    {
      urlHistory: [],
      historyIdx: -1,
    },
    name
  );
  const origin = React.useMemo(() => {
    return new URL(props.origin).origin;
  }, [props.origin]);

  const sendMessage = (message: IframeNavigationMessage) => {
    if (!iframeRef.current?.contentWindow) {
      return;
    }
    iframeRef.current.contentWindow.postMessage(message, origin);
  };

  const moveHistory = (diff: number) => {
    const { historyIdx, urlHistory } = getState();
    const newIdx = R.clamp(historyIdx + diff, {
      min: 0,
      max: urlHistory.length - 1,
    });
    setState(draft => {
      draft.historyIdx = newIdx;
    });
  };

  React.useEffect(() => {
    const onMessage = (e: MessageEvent<any>) => {
      if (e.origin !== origin) {
        return;
      }
      const action = e.data as IframeNavigationCallbackMessage;
      if (action.target !== 'navigation') {
        return;
      }
      switch (action.type) {
        case 'navigated': {
          const { url } = action.payload;
          if (R.last(getState().urlHistory) === url) {
            return;
          }
          setState(draft => {
            draft.urlHistory = draft.urlHistory.slice(0, draft.historyIdx + 1);
            draft.historyIdx = draft.urlHistory.length;
            draft.urlHistory.push(url);
          });
          break;
        }
        case 'did-go': {
          const { diff } = action.payload;
          moveHistory(diff);
          break;
        }
        case 'replaced': {
          const { url } = action.payload;
          setState(draft => {
            if (draft.urlHistory[draft.historyIdx]) {
              draft.urlHistory[draft.historyIdx] = url;
            }
          });
          break;
        }
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  const { historyIdx, urlHistory } = state;
  const currentUrl = React.useMemo(() => {
    return urlHistory[historyIdx] ?? '/';
  }, [historyIdx, urlHistory]);

  const actions = useActions<Actions>({
    registerIframe: iframe => {
      iframeRef.current = iframe;
    },
  });

  React.useEffect(() => {
    urlInputRef.current.value = currentUrl;
  }, [currentUrl]);

  return (
    <Provider actions={actions} state={state}>
      <div
        css={[
          tw`bg-gray-100 flex-1 flex flex-col`,
          shallowHidden && tw`hidden`,
        ]}
      >
        <div tw="shadow-md flex p-2 items-center space-x-2">
          <IconButton
            disabled={historyIdx < 1}
            onClick={() => {
              sendMessage({
                target: 'navigation',
                type: 'go',
                payload: { diff: -1 },
              });
              moveHistory(-1);
            }}
          >
            <ArrowLeftIcon />
          </IconButton>
          <IconButton
            disabled={historyIdx >= urlHistory.length - 1}
            onClick={() => {
              sendMessage({
                target: 'navigation',
                type: 'go',
                payload: { diff: 1 },
              });
              moveHistory(1);
            }}
          >
            <ArrowRightIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              sendMessage({
                target: 'navigation',
                type: 'refresh',
              });
            }}
          >
            <RefreshIcon />
          </IconButton>
          <input
            ref={urlInputRef}
            css={[
              tw`h-6 rounded-md border-gray-300 flex-1 text-gray-700 flex-shrink min-w-0 text-sm leading-none px-2 py-0`,
              tw`focus:( ring-0 outline-none border-gray-400 bg-gray-50 )`,
            ]}
            type="text"
            defaultValue="/"
            onKeyPress={e => {
              if (e.key === 'Enter') {
                let value = (e.target as HTMLInputElement).value.trim();
                if (value[0] !== '/') {
                  value = '/' + value;
                }
                if (value !== currentUrl) {
                  sendMessage({
                    target: 'navigation',
                    type: 'navigate',
                    payload: { url: value },
                  });
                }
              }
            }}
          />
        </div>
        <div tw="flex-1">{children}</div>
      </div>
    </Provider>
  );
}

export function useWebNavigatorActions() {
  return useContext().actions;
}

export function useWebNavigatorState() {
  return useContext().state;
}
