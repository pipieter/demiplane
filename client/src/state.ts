import Background from "./models/background";
import type { Token } from "./models/token";

interface StateCallbackKeyMap {
  background_change: Background;
  token_create: Token;
  token_select: Token[];
}

class Listeners {
  private map: Map<keyof StateCallbackKeyMap, any[]>;

  constructor() {
    this.map = new Map();
    this.map.set("background_change", []);
    this.map.set("token_create", []);
    this.map.set("token_select", []);
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
  private tokens: Token[];
  private selected: Token[];
  private background: Background;

  private listeners: Listeners;

  constructor() {
    this.tokens = [];
    this.selected = [];
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

  public createToken(token: Token) {
    this.tokens.push(token);
    this.listeners.emit("token_create", token);
  }

  public selectTokens(ids: string[]) {
    this.selected = this.tokens.filter((token) => ids.includes(token.id));
    this.listeners.emit("token_select", this.selected);
  }
}

export default State;
