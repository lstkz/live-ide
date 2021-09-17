import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface TabLoaderProps {
  children: React.ReactNode;
}

export function TabLoader(props: TabLoaderProps) {
  const { children } = props;

  return (
    <div tw="h-full">
      {children}
      <div tw="flex h-3/4 items-center justify-center">
        <FontAwesomeIcon
          tw="text-indigo-300 text-5xl animate-spin-slow"
          icon={faSpinner}
        />
      </div>
    </div>
  );
}
