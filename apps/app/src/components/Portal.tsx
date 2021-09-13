import ReactDOM from 'react-dom';
import React from 'react';

interface PortalProps {
  children: React.ReactChild;
}

export function Portal(props: PortalProps) {
  const { children } = props;
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
    return <>{children}</>;
  }
  return ReactDOM.createPortal(children, document.querySelector('#portals')!);
}
