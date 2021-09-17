import React from 'react';
import tw from 'twin.macro';

interface SpinnerBoarderProps {
  className?: string;
  size?: 'sm';
}

export function SpinnerBoarder(props: SpinnerBoarderProps) {
  const { className, size } = props;
  return (
    <div
      css={[
        className,
        tw`inline-block border-current rounded-full animate-spin`,
        size === 'sm' && tw`w-4 h-4 border`,
        !size && tw`w-8 h-8 border`,
      ]}
      style={{
        borderRightColor: 'transparent',
      }}
    />
  );
}
