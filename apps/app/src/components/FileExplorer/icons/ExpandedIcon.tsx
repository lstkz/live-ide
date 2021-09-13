interface ExpandedIconProps {
  isExpanded: boolean;
}

export function ExpandedIcon(props: ExpandedIconProps) {
  const { isExpanded } = props;
  if (isExpanded) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16">
        <path
          fill="currentColor"
          d="M7.976 10.072l4.357-4.357.619.618L8.285 11h-.618L3 6.333l.619-.618 4.357 4.357z"
        ></path>
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path
        fill="currentColor"
        d="M5.7 13.7L5 13L9.6 8.4L5 3.7L5.7 3L10.7 8V8.7L5.7 13.7Z"
      ></path>
    </svg>
  );
}
