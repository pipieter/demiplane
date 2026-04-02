export class Listener<T> {
  // eslint-disable-next-line
  private listenerMap: Map<keyof T, any[]>;

  constructor() {
    this.listenerMap = new Map();
  }

  private listeners<K extends keyof T>(type: K): ((value: T[K]) => void)[] {
    if (this.listenerMap.get(type) === undefined) {
      this.listenerMap.set(type, []);
    }
    return this.listenerMap.get(type)!;
  }

  public listen<K extends keyof T>(type: K, listener: (value: T[K]) => void) {
    this.listeners(type).push(listener);
  }

  public emit<K extends keyof T>(type: K, value: T[K]) {
    this.listeners(type).forEach((listener) => listener(value));
  }
}
