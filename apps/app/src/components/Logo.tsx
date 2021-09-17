import Link from 'next/link';
import React from 'react';

interface LogoProps {
  imgCss?: any;
  black?: boolean;
  href?: string;
}

export function Logo(props: LogoProps) {
  const { href } = props;

  return (
    <Link href={href ?? '/'}>
      <a className="text-gray-300 tracking-wider font-medium font-mono">
        LIVE-IDE.DEV
      </a>
    </Link>
  );
}
