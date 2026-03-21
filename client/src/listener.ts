abstract class Listeners<T> {
  protected readonly keys: (keyof T)[] = [];
  private map: Map<keyof T, any[]>;

  constructor() {
    this.map = new Map();
    for (const key of this.keys) {
      this.map.set(key, []);
    }
  }

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

export default Listeners;
