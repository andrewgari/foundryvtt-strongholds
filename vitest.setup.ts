// Minimal Foundry global mocks for tests
(globalThis as any).Hooks = {
  _events: new Map<string, Function[]>(),
  once: (name: string, fn: Function) => {
    const arr = (Hooks._events.get(name) ?? []);
    arr.push(fn);
    Hooks._events.set(name, arr);
  },
  on: (name: string, fn: Function) => {
    const arr = (Hooks._events.get(name) ?? []);
    arr.push(fn);
    Hooks._events.set(name, arr);
  }
};

(globalThis as any).game = { user: { isGM: true } };

