import React from 'react';
import { VoidLink } from './VoidLink';
import { modalGlobalContext } from './ModalGlobalContext';
import { ModalContainer } from './ModalContainer';
import tw from 'twin.macro';

interface ModalContentProps {
  bgColor?: 'primary' | 'success' | 'danger' | 'warning' | 'dark-600' | 'black';
}

export interface ModalProps extends ModalContentProps {
  transparent?: boolean;
  isOpen: boolean;
  close: (source: 'close-button' | 'background' | 'esc') => void;
  children: React.ReactNode;
  size?: 'lg' | 'md' | 'sm' | 'full';
  maxHeight?: string;
  noBackgroundClose?: boolean;
  testId?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal(props: ModalProps) {
  const {
    isOpen,
    close,
    children,
    transparent,
    size,
    maxHeight,
    noBackgroundClose,
    testId,
    header,
    footer,
    bgColor,
    ...contentProps
  } = props;
  const modalRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      return () => {
        //
      };
    }

    const onKeyPress = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        close('esc');
      }
    };
    modalGlobalContext.addListener(onKeyPress);
    return () => {
      modalGlobalContext.removeListener(onKeyPress);
    };
  }, [isOpen]);

  const borderClass = bgColor ? tw`border-alpha-white07` : tw`border-gray-200`;

  React.useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <ModalContainer isOpen={isOpen}>
      <div
        tw="fixed top-0 left-0 w-full h-full opacity-40 bg-black"
        style={{ zIndex: 1001 }}
      />
      <div
        tw="fixed top-0 left-0 w-full h-full flex items-center justify-center"
        style={{ zIndex: 1001 }}
        data-modal-wrapper
        onClick={e => {
          const target = e.target as HTMLDivElement;
          if (target.hasAttribute('data-modal-wrapper') && !noBackgroundClose) {
            close('background');
          }
        }}
      >
        <div
          css={[
            tw`relative flex flex-col w-full bg-white outline-none mx-auto my-7 shadow-lg md:shadow-2xl`,
            bgColor && tw`text-gray-100`,
            bgColor === 'danger' && tw`bg-red-700`,
            bgColor === 'success' && tw`bg-green-700`,
            bgColor === 'primary' && tw`bg-indigo-700`,
            (size === 'md' || !size) && tw`md:max-w-xl`,
            size !== 'full' && tw`rounded-xl`,
          ]}
          {...contentProps}
          data-test={testId}
          tabIndex={-1}
          role="modal"
          ref={modalRef}
          style={{
            maxWidth:
              size === 'full' ? '100%' : size === 'lg' ? '80%' : undefined,
            height: size === 'full' ? '100%' : undefined,
          }}
        >
          {header && (
            <div
              css={[
                tw`relative flex items-start justify-between p-5 border-b rounded-t-xl`,
                borderClass,
              ]}
            >
              {header}
              <VoidLink
                tw="p-5 leading-none font-semibold -m-4 ml-auto opacity-75 text-xl border border-dotted border-transparent focus:border-gray-200 hover:opacity-100 cursor-pointer text-alpha-white60 outline-none hover:no-underline"
                data-test="close-btn"
                onClick={() => close('close-button')}
                aria-label="close"
              >
                ×
              </VoidLink>
            </div>
          )}
          <div tw="relative flex-auto p-6">{children}</div>
          {footer && (
            <div
              css={[
                tw`flex flex-wrap items-center justify-end rounded-b-xl p-5`,
                borderClass,
              ]}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </ModalContainer>
  );
}
