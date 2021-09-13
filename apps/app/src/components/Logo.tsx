import Link from 'next/link';
import React from 'react';
import tw from 'twin.macro';
import { LogoSvg } from './LogoSvg';

interface LogoProps {
  imgCss?: any;
  black?: boolean;
  href?: string;
}

export function Logo(props: LogoProps) {
  const { black, href, imgCss, ...rest } = props;

  return (
    <Link href={href ?? '/'}>
      <a>
        <span className="sr-only">Practice.dev</span>
        <LogoSvg css={[tw`h-8 w-auto`, imgCss]} {...rest} dark={black} />
      </a>
    </Link>
  );
}
