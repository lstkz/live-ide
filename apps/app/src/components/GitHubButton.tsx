import React from 'react';
import { useLayoutEffectFix } from 'src/hooks/useLayoutEffectFix';

export function GitHubButton() {
  const wrapperRef = React.useRef<HTMLAnchorElement>(null!);
  const btnRef = React.useRef<HTMLAnchorElement>(null!);

  useLayoutEffectFix(() => {
    void import('github-buttons').then(({ render }) => {
      render(btnRef.current, newNode => {
        wrapperRef.current.appendChild(newNode);
      });
    });
  }, []);
  return (
    <span ref={wrapperRef}>
      <a
        style={{ display: 'none' }}
        ref={btnRef}
        href="https://github.com/lstkz/live-ide"
        data-icon="octicon-star"
        data-show-count="true"
        aria-label="Star lstkz/live-ide on GitHub"
      >
        Star
      </a>
    </span>
  );
}
