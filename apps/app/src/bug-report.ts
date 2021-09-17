import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import React from 'react';
import { BUGSNAG_KEY } from './config';

export const bugsnag =
  BUGSNAG_KEY !== -1
    ? Bugsnag.start({
        apiKey: BUGSNAG_KEY,
        plugins: [new BugsnagPluginReact()],
      })
    : null;

export const ErrorBoundary = bugsnag
  ? Bugsnag.getPlugin('react')!.createErrorBoundary(React)
  : function ({ children }: { children?: any }) {
      return children;
    };
