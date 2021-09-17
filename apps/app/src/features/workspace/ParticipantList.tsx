import { ParticipantIcon } from './ParticipantIcon';
import { useWorkspaceState } from './WorkspaceModule';

export function ParticipantList() {
  const { identity, otherParticipants } = useWorkspaceState();
  if (!identity) {
    return null;
  }
  return (
    <div tw="ml-auto flex space-x-1">
      {otherParticipants
        .filter(item => item.id !== identity.id)
        .map(item => (
          <ParticipantIcon
            key={item.id}
            color={item.color as any}
            icon={item.icon as any}
          />
        ))}
      <ParticipantIcon
        color={identity.color as any}
        icon={identity.icon as any}
      />
    </div>
  );
}
