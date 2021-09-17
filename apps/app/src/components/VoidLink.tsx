import * as React from 'react';

export interface VoidLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export const VoidLink = React.forwardRef((props: VoidLinkProps, ref: any) => {
  const { onClick, ...rest } = props;
  return (
    <a
      role="button"
      tabIndex={0}
      onClick={ev => {
        ev.preventDefault();
        if (onClick) {
          onClick(ev);
        }
        return false;
      }}
      ref={ref}
      {...rest}
    />
  );
});
