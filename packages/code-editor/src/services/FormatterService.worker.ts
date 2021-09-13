import prettier from 'prettier/standalone';
import parserTypescript from 'prettier/parser-typescript';
import { FormatterAction, FormatterCallbackAction } from '../types';

declare const self: Worker;

function sendMessage(action: FormatterCallbackAction) {
  self.postMessage(action);
}

export function formatTsCode(code: string) {
  return prettier.format(code, {
    parser: 'typescript',
    plugins: [parserTypescript],
    semi: true,
    useTabs: false,
    printWidth: 80,
    tabWidth: 2,
    singleQuote: true,
    trailingComma: 'es5',
    jsxBracketSameLine: false,
    arrowParens: 'avoid',
  });
}

self.addEventListener('message', async event => {
  const action = event.data as FormatterAction;
  const { code, lang, version } = action.payload;
  try {
    switch (lang) {
      case 'typescript': {
        sendMessage({
          type: 'highlight',
          payload: {
            code: formatTsCode(code),
            version,
          },
        });
        break;
      }
      default:
        throw new Error('Not supported lang: ' + lang);
    }
  } catch (e) {
    sendMessage({
      type: 'error',
      payload: {
        error: e,
        version,
      },
    });
  }
});

export {};
