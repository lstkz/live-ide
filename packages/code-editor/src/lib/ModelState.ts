import produce, { Draft } from 'immer';
import { TypedEventEmitter } from './TypedEventEmitter';

export interface CallbackMap<S> {
  updated: (state: S) => void;
}

export type ModelStateUpdater<S> = (draft: Draft<S>) => void | S;

export class ModelState<S> {
  public state: S = null!;
  private emitter = new TypedEventEmitter<CallbackMap<S>>();

  constructor(initialState: S, private logName?: string) {
    this.state = initialState;
  }

  update(updater: ModelStateUpdater<S>) {
    const newState = produce(this.state, updater as any);
    this.state = newState;
    if (this.logName && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(this.logName, newState);
    }
    this.emitter.emit('updated', this.state);
  }

  addEventListener<T extends keyof CallbackMap<S>>(
    type: T,
    callback: CallbackMap<S>[T]
  ) {
    return this.emitter.addEventListener(type, callback);
  }
}
