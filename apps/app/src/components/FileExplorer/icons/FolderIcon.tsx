interface FolderIconProps {
  isOpen: boolean;
}

export function FolderIcon(props: FolderIconProps) {
  const { isOpen } = props;
  if (isOpen) {
    return (
      <svg viewBox="0 0 32 32">
        <title>default_folder_opened</title>
        <path
          d="M27.4,5.5H18.2L16.1,9.7H4.3V26.5H29.5V5.5Zm0,18.7H6.6V11.8H27.4Zm0-14.5H19.2l1-2.1h7.1V9.7Z"
          fill="#dcb67a"
        />
        <polygon
          points="25.7 13.7 0.5 13.7 4.3 26.5 29.5 26.5 25.7 13.7"
          fill="#dcb67a"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32">
      <title>default_folder</title>
      <path
        d="M27.5,5.5H18.2L16.1,9.7H4.4V26.5H29.6V5.5Zm0,4.2H19.3l1.1-2.1h7.1Z"
        fill="#c09553"
      />
    </svg>
  );
}
