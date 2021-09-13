interface IndicatorIconProps {
  className?: string;
}

export function IndicatorIcon(props: IndicatorIconProps) {
  const { className } = props;
  return (
    <svg className={className} width="16" height="16" aria-hidden="true">
      <circle fill="currentColor" cx="8" cy="8" r="4"></circle>
    </svg>
  );
}
