import Background from "./models/background";

interface StateCallbackKeyMap {
  background_change: Background;
}

class Listeners {
  private map: Map<keyof StateCallbackKeyMap, any[]>;

  constructor() {
    this.map = new Map();
    this.map.set("background_change", []);
  }

  private listeners<K extends keyof StateCallbackKeyMap>(type: K): ((value: StateCallbackKeyMap[K]) => void)[] {
    return this.map.get(type) ?? [];
  }

  public listen<K extends keyof StateCallbackKeyMap>(type: K, listener: (value: StateCallbackKeyMap[K]) => void) {
    this.listeners(type).push(listener);
  }

  public emit<K extends keyof StateCallbackKeyMap>(type: K, value: StateCallbackKeyMap[K]) {
    this.listeners(type).forEach((listener) => listener(value));
  }
}

class State {
  private background: Background;

  private listeners: Listeners;

  constructor() {
    this.background = new Background();
    this.listeners = new Listeners();
  }

  public listen<K extends keyof StateCallbackKeyMap>(type: K, listener: (value: StateCallbackKeyMap[K]) => void) {
    this.listeners.listen(type, listener);
  }

  public setBackground(href: string | null, width: number, height: number) {
    this.background.set(href, width, height);
    this.listeners.emit("background_change", this.background);
  }
}

export default State;
