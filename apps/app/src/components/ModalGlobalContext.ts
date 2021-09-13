const listeners: Array<(ev: WindowEventMap['keyup']) => any> = [];

if (typeof window != 'undefined') {
  window.addEventListener('keyup', e => {
    if (listeners.length) {
      listeners[0](e);
    }
  });
}

export const modalGlobalContext = {
  addListener(listener: (this: Window, ev: WindowEventMap['keyup']) => any) {
    listeners.unshift(listener);
  },
  removeListener(listener: (this: Window, ev: WindowEventMap['keyup']) => any) {
    listeners.splice(listeners.indexOf(listener), 1);
  },
};
