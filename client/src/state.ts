import Listeners from "./listener";
import Background from "./models/background";
import type { Token } from "./models/token";

interface StateListenerMap {
  background_change: Background;
  token_create: Token;
  token_select: Token[];
}

class StateListeners extends Listeners<StateListenerMap> {
  protected override keys: (keyof StateListenerMap)[] = ["background_change", "token_create", "token_select"];
}

class State {
  private tokens: Token[];
  private selected: Token[];
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

  public selectTokens(ids: string[]) {
    this.selected = this.tokens.filter((token) => ids.includes(token.id));
    this.listeners.emit("token_select", this.selected);
  }
}

export default State;
