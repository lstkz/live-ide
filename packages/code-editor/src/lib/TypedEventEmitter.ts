type FirstArg<T> = T extends (arg: infer U) => any ? U : never;

interface CallbackData {
  type: string;
  callback: (arg: any) => void;
}

export class TypedEventEmitter<TCallbackMap> {
  private callbacks: CallbackData[] = [];

  addEventListener<T extends keyof TCallbackMap>(
    type: T,
    callback: TCallbackMap[T]
  ) {
    const data = { type, callback } as any as CallbackData;
    this.callbacks.push(data);
    return () => {
      this.callbacks.splice(this.callbacks.indexOf(data), 1);
    };
  }

  emit<T extends keyof TCallbackMap>(type: T, arg: FirstArg<TCallbackMap[T]>) {
    this.callbacks.forEach(data => {
      if (data.type === type) {
        data.callback(arg);
      }
    });
  }

  dispose() {
    this.callbacks = [];
  }
}
