interface CloseIconProps {
  className?: string;
  css?: any;
}

export function CloseIcon(props: CloseIconProps) {
  const { className } = props;
  return (
    <svg className={className} width="16" height="16" aria-hidden="true">
      <path stroke="currentColor" d="M4 12L12 4M12 12L4 4"></path>
    </svg>
  );
}
