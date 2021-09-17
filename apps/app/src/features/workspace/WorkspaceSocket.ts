import { API_URL } from 'src/config';
import WS from 'reconnecting-websocket';
import { AppSocketMsg, WorkspaceIdentity } from 'shared';
import {
  ExtractWorkspaceUpdateData,
  WorkspaceUpdateDataType,
} from 'code-editor';
import { TypedEventEmitter } from 'code-editor/src/lib/TypedEventEmitter';

export class MainWorkspaceSocket {
  private ws: WS | null = null;
  private emitter: TypedEventEmitter<any> = new TypedEventEmitter();

  constructor(private workspaceId: string) {}

  start(identity: WorkspaceIdentity) {
    const socketUrl =
      API_URL.replace(/^http/, 'ws') +
      '/socket?workspaceIdentity=' +
      encodeURIComponent(JSON.stringify(identity));
    this.ws = new WS(socketUrl);
    const onMessage = (e: MessageEvent<any>) => {
      const msg = JSON.parse(e.data) as AppSocketMsg;
      if (
        msg.type === 'workspace-update' &&
        msg.payload.workspaceId === this.workspaceId
      ) {
        const sub = msg.payload;
        this.emitter.emit(sub.data.type, sub.data.payload);
      }
    };
    this.ws.addEventListener('message', onMessage);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.emitter.dispose();
    }
  }

  addEventListener<T extends WorkspaceUpdateDataType>(
    type: T,
    callback: (values: ExtractWorkspaceUpdateData<T>) => void
  ) {
    return this.emitter.addEventListener(type, callback);
  }
}
