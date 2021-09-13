import React from 'react';
import { CSSTransition } from 'react-transition-group';
import { Portal } from 'src/components/Portal';
import { useLayoutEffectFix } from 'src/hooks/useLayoutEffectFix';
import { FocusContainer } from './FocusContainer';
import styles from './ModalContainer.module.css';

interface ModalContainerProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export function ModalContainer(props: ModalContainerProps) {
  const { children, isOpen } = props;

  useLayoutEffectFix(() => {
    if (!isOpen) {
      return;
    }
    if (document.body.style.overflow === 'hidden') {
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <Portal>
      <>
        <CSSTransition
          in={isOpen}
          classNames={{
            enter: styles['modal-enter'],
            enterActive: styles['modal-enter-active'],
            exit: styles['modal-exit'],
            exitActive: styles['modal-exit-active'],
          }}
          timeout={150}
          unmountOnExit
          mountOnEnter
        >
          <FocusContainer data-focus-root>{children}</FocusContainer>
        </CSSTransition>
      </>
    </Portal>
  );
}
