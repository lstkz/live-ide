import {
  IframeNavigationCallbackMessage,
  IframeNavigationMessage,
} from 'shared';
import { PARENT_ORIGIN } from './config';
import { getIsNavigate } from './helper';

export function createNavigationProxy(ignoreParentOrigin = false) {
  function sendMessage(message: IframeNavigationCallbackMessage) {
    if (parent) {
      parent.postMessage(message, ignoreParentOrigin ? '*' : PARENT_ORIGIN);
    }
  }
  const isNavigate = getIsNavigate();
  setTimeout(() => {
    if (isNavigate) {
      sendMessage({
        target: 'navigation',
        type: 'navigated',
        payload: {
          url: location.pathname + location.search,
        },
      });
    }
  }, 100);

  const history_go = history.go.bind(history);
  const history_pushState = history.pushState.bind(history);
  const history_replaceState = history.replaceState.bind(history);

  history.go = diff => {
    if (diff) {
      sendMessage({
        target: 'navigation',
        type: 'did-go',
        payload: { diff },
      });
    }
    history_go(diff);
  };
  history.back = () => {
    history.go(-1);
  };
  history.forward = () => {
    history.go(1);
  };
  history.pushState = (data, title, url) => {
    history_pushState(data, title, url);
    if (url) {
      sendMessage({
        target: 'navigation',
        type: 'navigated',
        payload: { url: url.toString() },
      });
    }
  };
  history.replaceState = (data, title, url) => {
    history_replaceState(data, title, url);
    if (url) {
      sendMessage({
        target: 'navigation',
        type: 'replaced',
        payload: { url: url.toString() },
      });
    }
  };

  window.addEventListener('message', e => {
    if (!ignoreParentOrigin && e.origin !== PARENT_ORIGIN) {
      return;
    }
    const action = e.data as IframeNavigationMessage;
    if (action.target !== 'navigation') {
      return;
    }
    switch (action.type) {
      case 'go': {
        const { diff } = action.payload;
        history_go(diff);
        break;
      }
      case 'navigate': {
        const { url } = action.payload;
        location.href = url;
        break;
      }
      case 'refresh': {
        location.reload();
        break;
      }
    }
  });
}
