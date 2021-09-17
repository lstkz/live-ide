import async_hooks from 'async_hooks';

export class ContractHook {
  private asyncHook: async_hooks.AsyncHook = null!;
  private rootMapping: Map<number, number> = new Map();
  private context: Map<number, any> = new Map();

  constructor() {
    this.asyncHook = async_hooks.createHook({
      init: (asyncId, type, triggerAsyncId, resource) => {
        if (this.rootMapping.has(triggerAsyncId)) {
          const rootId = this.rootMapping.get(triggerAsyncId)!;
          this.rootMapping.set(asyncId, rootId);
        }
      },
      destroy: asyncId => {
        this.rootMapping.delete(asyncId);
        this.context.delete(asyncId);
      },
    });
  }

  getContext<T>(): T {
    const asyncId = this.getCurrentRoot();
    if (!this.context.has(asyncId)) {
      throw new Error('Context is not set');
    }
    return this.context.get(asyncId);
  }

  setContext<T>(data: T) {
    const asyncId = this.getCurrentRoot();
    this.context.set(asyncId, data);
  }

  isNewScope() {
    const asyncId = async_hooks.executionAsyncId();
    return !this.rootMapping.has(asyncId);
  }

  async runInNewScope(fn: (...args: any[]) => any) {
    const asyncResource = new async_hooks.AsyncResource('ROOT_CONTRACT');
    const asyncId = asyncResource.asyncId();
    this.rootMapping.set(asyncId, asyncId);
    return asyncResource.runInAsyncScope(fn);
  }

  enable() {
    this.asyncHook.enable();
  }

  disable() {
    this.asyncHook.disable();
  }

  private getCurrentRoot() {
    const asyncId = this.rootMapping.get(async_hooks.executionAsyncId());
    if (asyncId == null) {
      throw new Error('rootId not found');
    }
    return asyncId;
  }
}
