import React from 'react';
import { SimpleModal } from 'src/components/SimpleModal';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getErrorMessage } from 'src/common/helper';
import { createModuleContext, useImmer } from 'context-api';

interface Actions {
  show: (message: string | Error | unknown, noLog?: boolean) => void;
  showError: (message: string | Error | unknown, noLog?: boolean) => void;
}

interface State {
  message: string;
}
const [Provider, useContext] = createModuleContext<State, Actions>();

export interface ErrorModalProps {
  children: React.ReactNode;
}

export function ErrorModalModule(props: ErrorModalProps) {
  const { children } = props;
  const [state, setState] = useImmer({ isOpen: false, message: '' });
  const { isOpen, message } = state;

  const actions = React.useMemo<Actions>(
    () => ({
      hide: () =>
        setState(draft => {
          draft.isOpen = false;
        }),
      show: (message, noLog) => {
        if (process.env.NODE_ENV !== 'test' && !noLog) {
          if (typeof message === 'string') {
            console.error('An error occurred: ', message);
          } else {
            console.error(message);
          }
        }
        setState(draft => {
          draft.isOpen = true;
          draft.message =
            typeof message == 'string' ? message : getErrorMessage(message);
        });
      },
      showError: (...args) => {
        actions.show(...args);
      },
    }),
    []
  );

  const hideErrorModal = () =>
    setState(draft => {
      draft.isOpen = false;
    });

  return (
    <Provider state={state} actions={actions}>
      <SimpleModal
        testId="error-modal"
        bgColor="danger"
        isOpen={isOpen}
        close={hideErrorModal}
        icon={<FontAwesomeIcon size="4x" icon={faExclamationCircle} />}
        header="Ooops..."
        title="An error occurred"
        description={<span data-test="error-msg">{message}</span>}
      />
      {children}
    </Provider>
  );
}

export function useErrorModalActions() {
  return useContext().actions;
}
