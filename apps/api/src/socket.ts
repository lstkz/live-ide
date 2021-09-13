import WebSocket from 'ws';
import http from 'http';
import Url from 'url';
import Query from 'querystring';
import net from 'net';
import { ampq } from './lib';
import { getAppUser } from './contracts/user/_common';
import { AppUser } from './types';
import { AppSocketMsg } from 'shared';

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

  wss.on('connection', async (ws, user: AppUser) => {
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });
    const userId = user._id.toHexString();
    if (!connectionMap.has(userId)) {
      connectionMap.set(userId, []);
    }
    const userConnections = connectionMap.get(userId)!;
    userConnections.push(ws);
    ws.on('close', () => {
      userConnections.splice(userConnections.indexOf(ws), 1);
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
    const { userId } = (message as AppSocketMsg).payload;
    const userConnections = connectionMap.get(userId) ?? [];
    userConnections.forEach(ws => {
      try {
        ws.send(JSON.stringify(message));
      } catch (e) {
        console.error('Failed to send data to socket', e, { message });
      }
    });
  });
}
