import * as R from 'remeda';
import amqplib from 'amqplib';
import { reportError, reportInfo } from '../common/bugsnag';
import { UnreachableCaseError } from '../common/errors';
import { sleep } from '../common/helper';
import { logger } from '../common/logger';

export interface AmpqMessage<T = any> {
  id: string;
  type: string;
  payload: T;
}

export interface AmpqPublishMessage<T = any> {
  type: string;
  payload: T;
}

type OnMessageFn = (message: AmpqMessage) => Promise<void> | void;

export interface AmpqHandler {
  type: string;
  onMessage: OnMessageFn;
}

function _delay(n: number) {
  return new Promise<void>(resolve => setTimeout(resolve, n));
}

function _getRequeueDelay(retry: number) {
  const s = 1000;
  const m = 60 * s;
  if (retry < 5) {
    return s;
  }
  if (retry < 10) {
    return m;
  }
  if (retry < 100) {
    return 5 * m;
  }
  return 20 * m;
}

interface AmpqOptions {
  hosts: string[];
  prefetchLimit: number;
  port?: number;
  username: string;
  password: string;
  eventQueueSuffix: string;
}

const SOCKETS_EXCHANGE = 'sockets';
const TASKS_QUEUE = 'tasks';
const EVENTS_EXCHANGE = 'events';
const RETRY_QUEUE_SUFFIX = 'retry';

const DEFAULT_RETRY_QUEUE_PARAMS = {
  durable: true,
  deadLetterExchange: '',
  messageTtl: 1000 * 60 * 12,
};

interface ProcessMessageOptions {
  channel: amqplib.Channel;
  msg: amqplib.ConsumeMessage | undefined | null;
  onMessage: OnMessageFn;
  queueName: string;
  retryQueue?: string;
}

type AmpqMode = 'publish' | 'subscribe' | 'socket';

export class Ampq {
  private connection: amqplib.Connection | null = null;
  private channel: amqplib.Channel | null = null;
  private isConnectCalled = false;
  private eventHandlers: Map<string, AmpqHandler[]> = new Map();
  private taskHandlers: Map<string, AmpqHandler> = new Map();
  private socketHandler: OnMessageFn | null = null;
  private isReconnecting = false;
  private hostNameIndex = 0;
  private modes: AmpqMode[] = [];
  private processingCount = 0;
  private isShutdown = false;
  private consumeTagMap: Record<string, string> = {};

  constructor(private options: AmpqOptions) {
    this.hostNameIndex = Math.round(Math.random() * 100) % options.hosts.length;
  }

  async connect(modes?: AmpqMode[]) {
    if (this.isShutdown) {
      return;
    }
    if (modes) {
      this.modes = modes;
    }
    if (!this.modes) {
      throw new Error('Modes required');
    }
    this.isConnectCalled = true;
    const { hosts, port, username, password } = this.options;
    const nextIndex = ++this.hostNameIndex % hosts.length;
    const host = hosts[nextIndex];
    this.connection = await amqplib.connect({
      protocol: 'amqp',
      hostname: host,
      port: port ?? 5672,
      username,
      password,
    });
    this.connection.on('error', e => {
      reportError({
        error: e,
        source: 'worker',
        data: {
          info: 'connection error',
        },
        isHandled: true,
      });
    });
    this.connection.on('close', () => {
      if (!this.isReconnecting) {
        void this.tryReconnect();
      }
    });
    await this.initChannels();
  }

  addEventHandler(handler: AmpqHandler) {
    this.assertConnectNotCalled();
    if (!this.eventHandlers.has(handler.type)) {
      this.eventHandlers.set(handler.type, []);
    }
    this.eventHandlers.get(handler.type)!.push(handler);
  }

  addTaskHandler(handler: AmpqHandler) {
    this.assertConnectNotCalled();
    if (this.taskHandlers.has(handler.type)) {
      throw new Error('Duplicated task handler for ' + handler.type);
    }
    this.taskHandlers.set(handler.type, handler);
  }

  addSocketHandler(handler: OnMessageFn) {
    this.assertConnectNotCalled();
    if (this.socketHandler) {
      throw new Error('Duplicated socket handler');
    }
    this.socketHandler = handler;
  }

  async publishEvent(msg: AmpqPublishMessage) {
    await this.retryPublishMessage('events', msg);
  }

  async publishTask(msg: AmpqPublishMessage) {
    await this.retryPublishMessage('tasks', msg);
  }

  async publishSocket(msg: AmpqPublishMessage) {
    await this.retryPublishMessage('socket', msg);
  }

  async shutdown() {
    logger.info('[AMPQ] shuting down');
    this.isShutdown = true;
    await Promise.all([
      Object.values(this.consumeTagMap).map(tag =>
        this.channel!.cancel(tag).catch(R.noop)
      ),
    ]);
    if (this.processingCount) {
      logger.info('[AMPQ] waiting for pending handlers');
    }
    while (this.processingCount) {
      await sleep(100);
    }
    logger.info('[AMPQ] closing channel');
    await this.channel!.close();
    logger.info('[AMPQ] closing connection');
    await this.connection!.close();
    logger.info('[AMPQ] shutdown success');
  }

  private async retryPublishMessage(
    msgType: 'events' | 'tasks' | 'socket',
    msg: AmpqPublishMessage,
    retry = 0
  ) {
    if (retry === 1 || (retry > 0 && retry % 100 === 0)) {
      reportInfo({
        message: `Trying to retry publish (retry = ${retry})`,
        source: 'worker',
        data: {
          msg,
        },
      });
    }
    let success = false;
    if (this.channel) {
      try {
        const ampqMessage: AmpqPublishMessage = {
          type: msg.type,
          payload: msg.payload,
        };
        const options = {
          messageId: R.randomString(20),
        };
        const serialized = Buffer.from(JSON.stringify(ampqMessage));
        switch (msgType) {
          case 'events': {
            this.channel.publish(EVENTS_EXCHANGE, '', serialized, options);
            break;
          }
          case 'socket': {
            this.channel.publish(SOCKETS_EXCHANGE, '', serialized, options);
            break;
          }
          case 'tasks': {
            this.channel.sendToQueue(TASKS_QUEUE, serialized, options);
            break;
          }
          default: {
            throw new UnreachableCaseError(msgType);
          }
        }
        success = true;
      } catch (e: any) {
        reportError({
          error: e,
          source: 'worker',
          data: {
            info: 'Error when publish message',
          },
          isHandled: true,
        });
      }
    }
    if (!success) {
      await _delay(1000);
      await this.retryPublishMessage(msgType, msg, retry + 1);
      return;
    }
  }

  private async tryReconnect() {
    this.isReconnecting = true;
    try {
      await this.connect();
      this.isReconnecting = false;
    } catch (e: any) {
      reportError({
        error: e,
        source: 'worker',
        data: {
          info: 'Reconnect error',
        },
        isHandled: true,
      });
      setTimeout(() => this.tryReconnect(), 1000);
    }
  }

  private assertConnectNotCalled() {
    if (this.isConnectCalled) {
      throw new Error('Connect already called');
    }
  }

  private async initChannels() {
    if (!this.connection) {
      throw new Error('Connection not created');
    }
    const channel = await this.connection!.createChannel();
    this.channel = channel;
    await channel.assertQueue(TASKS_QUEUE, { durable: true });
    await channel.assertExchange(EVENTS_EXCHANGE, 'fanout', { durable: true });
    await channel.assertExchange(SOCKETS_EXCHANGE, 'fanout', { durable: true });
    await channel.prefetch(this.options.prefetchLimit);

    if (this.modes.some(x => x === 'subscribe')) {
      await this.setupEventHandlers(channel);
      await this.setupTaskHandlers(channel);
    }
    if (this.modes.some(x => x === 'socket')) {
      await this.setupSockets(channel);
    }
  }
  private getEventsQueueName() {
    return `${EVENTS_EXCHANGE}:${this.options.eventQueueSuffix}`;
  }

  private async setupEventHandlers(channel: amqplib.Channel) {
    const queueName = this.getEventsQueueName();
    const retryQueue = `${queueName}:${RETRY_QUEUE_SUFFIX}`;
    await channel.assertQueue(queueName, { durable: true });
    await channel.assertQueue(retryQueue, {
      ...DEFAULT_RETRY_QUEUE_PARAMS,
      deadLetterRoutingKey: queueName,
    });
    await channel.bindQueue(queueName, EVENTS_EXCHANGE, '');

    await this.consume(channel, queueName, async msg => {
      await this.processMessageWrapped({
        channel,
        msg,
        onMessage: async message => {
          const handlers = this.eventHandlers.get(message.type);
          if (!handlers) {
            return;
          }
          await Promise.all(
            handlers.map(handler => handler.onMessage(message))
          );
        },
        queueName: queueName,
        retryQueue: retryQueue,
      });
    });
  }

  private async setupTaskHandlers(channel: amqplib.Channel) {
    await channel.assertQueue(TASKS_QUEUE, { durable: true });
    const taskRetryQueue = `${TASKS_QUEUE}:${RETRY_QUEUE_SUFFIX}`;
    await channel.assertQueue(taskRetryQueue, {
      ...DEFAULT_RETRY_QUEUE_PARAMS,
      deadLetterRoutingKey: TASKS_QUEUE,
    });

    await this.consume(channel, TASKS_QUEUE, async msg => {
      await this.processMessageWrapped({
        channel,
        msg,
        onMessage: async message => {
          const handler = this.taskHandlers.get(message.type);
          if (!handler) {
            throw new Error('Missing task handler for: ' + message.type);
          }
          await handler.onMessage(message);
        },
        queueName: TASKS_QUEUE,
        retryQueue: taskRetryQueue,
      });
    });
  }

  private async setupSockets(channel: amqplib.Channel) {
    if (!this.socketHandler) {
      throw new Error('Socket handler not set');
    }
    const tmpQueue = await channel.assertQueue('', {
      exclusive: true,
    });
    const queueName = tmpQueue.queue;
    await channel.bindQueue(queueName, SOCKETS_EXCHANGE, '');
    await this.consume(channel, queueName, async msg => {
      await this.processMessageWrapped({
        channel,
        msg,
        onMessage: async message => {
          try {
            await this.socketHandler!(message);
          } catch (e: any) {
            reportError({
              error: e,
              source: 'worker',
              data: {
                info: `Failed to setup socket message`,
                message,
              },
              isHandled: true,
            });
          }
        },
        queueName,
      });
    });
  }

  private async consume(
    channel: amqplib.Channel,
    queueName: string,
    onMessage: (msg: amqplib.ConsumeMessage | null) => void
  ) {
    const ret = await channel.consume(queueName, onMessage);
    this.consumeTagMap[queueName] = ret.consumerTag;
  }

  private async processMessageWrapped(options: ProcessMessageOptions) {
    this.processingCount++;
    try {
      await this.processMessage(options);
    } finally {
      this.processingCount--;
    }
  }

  private async processMessage(options: ProcessMessageOptions) {
    const { channel, msg, onMessage, queueName, retryQueue } = options;
    try {
      if (!msg) {
        return;
      }
      const retryCount = msg.properties.headers['x-retry'] ?? 0;
      const messageId = msg.properties.messageId;
      if (!messageId) {
        reportInfo({
          source: 'worker',
          message: 'no messageId ignoring',
          data: {
            msg,
          },
        });
        channel.ack(msg);
        return;
      }
      const uniqueMessageId = `${messageId}:${queueName}`;
      let publishMsg: AmpqPublishMessage = null!;
      try {
        publishMsg = JSON.parse(msg.content.toString('utf8'));
      } catch (e: any) {
        reportError({
          error: e,
          source: 'worker',
          data: {
            info: 'Invalid json, ignoring message',
            msg,
          },
          isHandled: true,
        });
        channel.ack(msg);
        return;
      }
      try {
        await onMessage({
          id: uniqueMessageId,
          type: publishMsg.type,
          payload: publishMsg.payload,
        });
      } catch (e: any) {
        reportError({
          error: e,
          source: 'worker',
          data: {
            info: `failed to process a message from ${queueName} queue (retry ${retryCount})`,
            publishMsg,
          },
          isHandled: true,
        });
        if (retryQueue) {
          channel.sendToQueue(retryQueue, msg.content, {
            expiration: _getRequeueDelay(retryCount),
            headers: {
              ...msg.properties.headers,
              'x-retry': retryCount + 1,
            },
            messageId,
          });
        }
      } finally {
        channel.ack(msg);
      }
    } catch (e: any) {
      reportError({
        error: e,
        source: 'worker',
        data: msg,
      });
    }
  }
}
