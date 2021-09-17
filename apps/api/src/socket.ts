import WebSocket from 'ws';
import http from 'http';
import Url from 'url';
import Query from 'querystring';
import net from 'net';
import { ampq } from './lib';
import { getAppUser } from './contracts/user/_common';
import { AppUser } from './types';
import { AppSocketMsg, WorkspaceIdentity } from 'shared';
import { dispatchEvent } from './dispatch';
import { getSocketId } from './common/helper';

declare module 'ws' {
  class _WS extends WebSocket {}
  export interface WebSocket extends _WS {
    userId: string;
    isAlive: boolean;
  }
}

const connectionMap = new Map<string, WebSocket[]>();

export function startSockets(server: http.Server) {
  const wss = new WebSocket.Server({ noServer: true });

  setInterval(() => {
    wss.clients.forEach(ws => {
      if (!ws.isAlive) {
        return ws.terminate();
      }
      ws.ping();
    });
  }, 30000);

  wss.on('connection', async (ws, user: AppUser | WorkspaceIdentity) => {
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });
    const isUser = 'accessToken' in user;
    const socketId = getSocketId(user);
    if (!connectionMap.has(socketId)) {
      connectionMap.set(socketId, []);
    }
    const userConnections = connectionMap.get(socketId)!;
    userConnections.push(ws);
    if (!isUser) {
      void dispatchEvent({
        type: 'workspace-identity-connected',
        payload: {
          identity: user,
        },
      });
    }
    ws.on('close', () => {
      userConnections.splice(userConnections.indexOf(ws), 1);
      if (!isUser) {
        void dispatchEvent({
          type: 'workspace-identity-disconnected',
          payload: {
            identity: user,
          },
        });
      }
    });
  });

  server.on(
    'upgrade',
    async (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
      const url = Url.parse(request.url ?? '');
      const query = Query.parse(url.query ?? '');
      const send401 = () => {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
      };
      if (query.workspaceIdentity) {
        let identity: WorkspaceIdentity = null!;
        try {
          // todo validate props
          identity = JSON.parse(query.workspaceIdentity as string);
        } catch (e) {
          socket.write('HTTP/1.1 400 Bad request\r\n\r\n');
          socket.destroy();
          return;
        }
        wss.handleUpgrade(request, socket, head, function done(ws) {
          wss.emit('connection', ws, identity);
        });
        return;
      }
      if (!query.token || typeof query.token !== 'string') {
        send401();
        return;
      }
      const user = await getAppUser(query.token).catch(() => null);
      if (!user) {
        send401();
        return;
      }
      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, user);
      });
    }
  );

  ampq.addSocketHandler(async message => {
    const { socketId } = (message as AppSocketMsg).payload;
    const userConnections = connectionMap.get(socketId) ?? [];
    userConnections.forEach(ws => {
      try {
        ws.send(JSON.stringify(message));
      } catch (e) {
        console.error('Failed to send data to socket', e, { message });
      }
    });
  });
}
