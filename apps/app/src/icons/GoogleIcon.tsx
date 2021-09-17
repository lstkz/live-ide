import React from 'react';

interface GoogleIconProps {
  size?: number;
  className?: string;
}

export function GoogleIcon(props: GoogleIconProps) {
  const { size = 36, className } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      viewBox="0 0 36 36"
    >
      <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
        <path
          fill="#4285F4"
          d="M32.437 16.602c0-1.15-.106-2.258-.301-3.32H16.549v6.28h8.907c-.384 2.029-1.55 3.748-3.302 4.9v4.072h5.348c3.13-2.826 4.935-6.988 4.935-11.932z"
          transform="translate(2 2)"
        ></path>
        <path
          fill="#34A853"
          d="M16.55 32.467c4.468 0 8.214-1.453 10.952-3.933l-5.348-4.073c-1.482.974-3.378 1.55-5.605 1.55-4.31 0-7.958-2.855-9.26-6.693H1.76v4.206c2.723 5.306 8.32 8.943 14.79 8.943z"
          transform="translate(2 2)"
        ></path>
        <path
          fill="#FBBC05"
          d="M7.29 19.318a9.591 9.591 0 01-.52-3.084c0-1.07.188-2.11.52-3.085V8.943H1.76a15.98 15.98 0 000 14.581l5.53-4.206z"
          transform="translate(2 2)"
        ></path>
        <path
          fill="#EA4335"
          d="M16.55 6.456c2.43 0 4.61.82 6.326 2.428l4.747-4.656C24.756 1.608 21.01 0 16.549 0 10.08 0 4.483 3.638 1.76 8.943l5.53 4.206c1.3-3.837 4.95-6.693 9.26-6.693z"
          transform="translate(2 2)"
        ></path>
      </g>
    </svg>
  );
}
