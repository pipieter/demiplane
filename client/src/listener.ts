export abstract class Listener<T> {
  // eslint-disable-next-line
  private map: Map<keyof T, any[]>;

  constructor() {
    this.map = new Map();
    for (const key of this.keys()) {
      this.map.set(key, []);
    }
  }

  protected abstract keys(): (keyof T)[];

  private listeners<K extends keyof T>(type: K): ((value: T[K]) => void)[] {
    return this.map.get(type) ?? [];
  }

  public listen<K extends keyof T>(type: K, listener: (value: T[K]) => void) {
    this.listeners(type).push(listener);
  }

  public emit<K extends keyof T>(type: K, value: T[K]) {
    this.listeners(type).forEach((listener) => listener(value));
  }
}

export abstract class ListenerContainer<L extends Listener<T>, T> {
  private listeners: L;

  constructor(listeners: L) {
    this.listeners = listeners;
  }

  public listen<K extends keyof T>(type: K, listener: (value: T[K]) => void) {
    this.listeners.listen(type, listener);
  }

  public emit<K extends keyof T>(type: K, value: T[K]) {
    this.listeners.emit(type, value);
  }
}
