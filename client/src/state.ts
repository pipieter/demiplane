import Listeners from "./listener";
import Background from "./models/background";
import type { Token } from "./models/token";
import type { Transform } from "./models/transform";

interface StateListenerMap {
  background_change: Background;
  token_create: Token;
  token_select: [string[], string[]];
  token_transform: [Token, Transform];
  token_delete: string[];
}

class StateListeners extends Listeners<StateListenerMap> {
  protected override keys(): (keyof StateListenerMap)[] {
    return ["background_change", "token_create", "token_select", "token_transform"];
  }
}

class State {
  private tokens: Token[];
  private selected: string[];
  private background: Background;

  private listeners: StateListeners;

  constructor() {
    this.tokens = [];
    this.selected = [];
    this.background = new Background();
    this.listeners = new StateListeners();
  }

  public listen<K extends keyof StateListenerMap>(type: K, listener: (value: StateListenerMap[K]) => void) {
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

  public removeTokens(ids: string | string[]) {
    if (typeof ids === "string") ids = [ids];

    this.tokens = this.tokens.filter((token) => !ids.includes(token.id));
    this.selected = this.selected.filter((id) => !ids.includes(id));
    this.listeners.emit("token_delete", ids);
  }

  public transformToken(transform: Transform) {
    const token = this.tokens.find((token) => token.id === transform.id);
    if (token) {
      token.x = transform.x;
      token.y = transform.y;
      token.w = transform.w;
      token.h = transform.h;
      this.listeners.emit("token_transform", [token, transform]);
    }
  }

  public selectTokens(ids: string[]) {
    // Temporary console.log until resizebox is re-implemented
    console.log(`Selected [${ids}]`)
    const previous = [...this.selected];
    this.selected = [...ids];
    this.listeners.emit("token_select", [previous, ids]);
  }

  public getSelected(): string[] {
    return [...this.selected];
  }
}

export default State;
