import * as React from 'react';

export function SvgCut({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={2560}
      height={100}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      viewBox="0 0 2560 100"
    >
      <path d="M2560 0v100H0z" />
    </svg>
  );
}
