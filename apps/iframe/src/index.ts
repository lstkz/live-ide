import { PARENT_ORIGIN } from './config';
import {
  IframeCallbackMessage,
  IframeMessage,
  IframeNavigationCallbackMessage,
} from 'shared';
import { detect } from 'detect-browser';

const browser = detect();

const USE_SHIM = !browser || browser.name !== 'chrome';

import { createNavigationProxy } from './NavigationProxy';

function sendMessage(
  message: IframeCallbackMessage | IframeNavigationCallbackMessage
) {
  if (parent) {
    parent.postMessage(message, PARENT_ORIGIN);
  }
}

function showError(content: string) {
  document.getElementById('__bundler-error')?.remove();
  const container = document.createElement('div');
  container.setAttribute('id', '__bundler-error');
  container.textContent = content;
  container.style.whiteSpace = 'pre';
  container.style.fontFamily =
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
  container.style.fontSize = '12px';
  container.style.background = '#FEF2F2';
  container.style.color = '#DC2626';
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.right = '0';
  container.style.top = '0';
  container.style.bottom = '0';
  container.style.padding = '15px';
  container.style.overflow = 'auto';

  document.body.append(container);
}

window.addEventListener('error', function (event) {
  showError(event.error.stack);
});

window.addEventListener('message', e => {
  if (e.origin !== PARENT_ORIGIN) {
    return;
  }
  const action = e.data as IframeMessage;
  switch (action.type) {
    case 'error': {
      const { error } = action.payload;
      showError(error.message);
      break;
    }
    case 'inject': {
      document.getElementById('__bundler-error')?.remove();
      const { data, importMap } = action.payload;
      if (!document.body.querySelector('#root')) {
        const root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.append(root);
      }
      const head = document.head;
      if (!head.querySelector('#__importmap')) {
        const importScript = document.createElement('script');
        importScript.setAttribute(
          'type',
          USE_SHIM ? 'importmap-shim' : 'importmap'
        );
        importScript.setAttribute('id', '__importmap');
        importScript.innerHTML = JSON.stringify(
          {
            imports: importMap,
          },
          null,
          2
        );
        head.append(importScript);
      }
      head.querySelector('#__app')?.remove();
      const script = document.createElement('script');
      script.setAttribute('type', USE_SHIM ? 'module-shim' : 'module');
      script.setAttribute('id', '__app');
      script.innerHTML = data.code;
      head.append(script);
      head.querySelector('#__css')?.remove();
      if (data.css) {
        const style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.setAttribute('id', '__css');
        style.innerHTML = data.css;
        head.append(style);
      }
      if (!document.body.querySelector('#__module_shim') && USE_SHIM) {
        const moduleShimScript = document.createElement('script');
        moduleShimScript.setAttribute('type', 'text/javascript');
        moduleShimScript.setAttribute('id', '__module_shim');
        moduleShimScript.setAttribute(
          'src',
          'https://unpkg.com/es-module-shims@0.12.8/dist/es-module-shims.js'
        );
        head.append(moduleShimScript);
      }
      break;
    }
  }
});

sendMessage({
  target: 'preview',
  type: 'hard-reload',
});

createNavigationProxy();

export {};
