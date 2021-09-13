import * as React from 'react';

const getParentPane = (input: Element | null) => {
  let root = input;
  while (root !== null) {
    if (root.getAttribute('data-focus-root')) {
      return root;
    }
    root = root.parentElement;
  }
  return null;
};

interface FocusContainerProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export function FocusContainer(props: FocusContainerProps) {
  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Tab') {
        const pane = getParentPane(document.activeElement);
        if (!pane) {
          return;
        }
        const allFocusableElements = Array.from(
          pane.querySelectorAll(
            'button:not([disabled]),[role="button"]:not([disabled]),input:not([disabled]),textarea:not([disabled])'
          )
        );
        const idx = allFocusableElements.findIndex(
          x => x === document.activeElement
        );
        const count = allFocusableElements.length;
        if (idx === -1) {
          return;
        }
        const nextIndex = (count + idx + (e.shiftKey ? -1 : 1)) % count;
        e.preventDefault();
        const nextFocused = allFocusableElements[nextIndex] as HTMLElement;
        nextFocused.focus();
      }
    },
    []
  );

  return <div {...props} onKeyDown={onKeyDown} />;
}
