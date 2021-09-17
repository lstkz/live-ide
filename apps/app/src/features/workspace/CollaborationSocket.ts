import {
  CollaborationSocketCallbackMap,
  ICollaborationSocket,
} from 'code-editor';
import { TypedEventEmitter } from 'code-editor/src/lib/TypedEventEmitter';
import { ParticipantInfo } from 'shared';
import { MainWorkspaceSocket } from './WorkspaceSocket';

export class CollaborationSocket implements ICollaborationSocket {
  private emitter: TypedEventEmitter<CollaborationSocketCallbackMap> =
    new TypedEventEmitter();
  private participants: ParticipantInfo[] = [];

  constructor(mainSocket: MainWorkspaceSocket) {
    mainSocket.addEventListener('participants-info', ({ participants }) => {
      this.participants = participants;
    });
    mainSocket.addEventListener('cursor-updated', ({ cursor, fromId }) => {
      const participant = this.getParticipant(fromId);
      if (participant) {
        const { color, icon } = participant.identity;
        this.emitter.emit('cursorUpdated', {
          userClassName: `lv-user.lv-user--${color}.lv-user--${icon}`,
          cursorClassName: `lv-cursor.lv-cursor--${color}`,
          fileId: cursor?.nodeId ?? null,
          identityId: fromId,
          position: cursor?.position ?? null,
          secondaryPositions: cursor?.secondaryPositions ?? [],
        });
      }
    });
  }

  private getParticipant(id: string) {
    return this.participants.find(x => x.identity.id === id);
  }

  addEventListener<T extends keyof CollaborationSocketCallbackMap>(
    type: T,
    callback: CollaborationSocketCallbackMap[T]
  ) {
    return this.emitter.addEventListener(type, callback);
  }
}
