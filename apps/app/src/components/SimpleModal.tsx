import React from 'react';
import { Modal, ModalProps } from 'src/components/Modal';
import { Button } from './Button';

interface SimpleModalProps
  extends Pick<ModalProps, 'isOpen' | 'close' | 'bgColor' | 'testId'> {
  icon: React.ReactNode;
  header?: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
}

export function SimpleModal(props: SimpleModalProps) {
  const { isOpen, close, icon, title, description, bgColor, ...rest } = props;
  return (
    <Modal
      {...rest}
      bgColor={bgColor}
      isOpen={isOpen}
      close={close}
      footer={
        <Button
          testId="close-btn"
          type="white"
          focusBg={
            bgColor === 'danger'
              ? 'red-600'
              : bgColor === 'success'
              ? 'red-600'
              : bgColor === 'primary'
              ? 'indigo-600'
              : undefined
          }
          ring="white"
          onClick={() => close('close-button')}
        >
          Close
        </Button>
      }
    >
      <div className="text-center py-6">
        {icon}
        <h3 className="text-2xl text-center mt-4 mb-3 text-white">{title}</h3>
        {description}
      </div>
    </Modal>
  );
}
