import { Listener, ListenerContainer } from "./listener";
import Background from "./models/background";
import Grid, { type GridData } from "./models/grid";
import type { Token } from "./models/token";
import type { Transform } from "./models/transform";
import type { User } from "./models/user";
import Viewport from "./models/viewport";

interface StateListenerMap {
  background_change: Background;
  grid_change: GridData;
  user_change: User;
  token_create: Token;
  token_select: [Token[], Token[]];
  token_transform: [Token, Transform];
  token_delete: string[];
}

class StateListeners extends Listener<StateListenerMap> {
  protected override keys(): (keyof StateListenerMap)[] {
    return [
      "background_change",
      "grid_change",
      "user_change",
      "token_create",
      "token_select",
      "token_transform",
      "token_delete",
    ];
  }
}

class State extends ListenerContainer<StateListeners, StateListenerMap> {
  private tokens: Token[];
  private selected: Token[];
  private users: Record<string, User>;
  private myId: string;
  private background: Background;
  private grid: Grid;
  private viewport: Viewport;

  constructor() {
    super(new StateListeners());

    this.tokens = [];
    this.selected = [];
    this.users = {};
    this.myId = "";
    this.grid = new Grid();
    this.viewport = new Viewport();
    this.background = new Background();
  }

  public setBackground(href: string | null, width: number, height: number) {
    this.background.set(href, width, height);
    this.emit("background_change", this.background);
  }

  public createToken(token: Token) {
    this.tokens.push(token);
    this.emit("token_create", token);
  }

  public createTokens(tokens: Token[]) {
    for (const token of tokens) {
      this.createToken(token);
    }
  }

  public removeTokens(ids: string | string[]) {
    if (typeof ids === "string") ids = [ids];

    const previousSelected = [...this.selected];

    this.tokens = this.tokens.filter((token) => !ids.includes(token.id));
    this.selected = this.selected.filter((token) => !ids.includes(token.id));
    this.emit("token_delete", ids);
    this.emit("token_select", [previousSelected, this.selected]);
  }

  public transformToken(transform: Transform) {
    const token = this.tokens.find((token) => token.id === transform.id);
    if (token) {
      token.x = transform.x;
      token.y = transform.y;
      token.w = transform.w;
      token.h = transform.h;
      token.r = transform.r;
      this.emit("token_transform", [token, transform]);
    }
  }

  public selectTokens(tokens: Token[]) {
    const previous = [...this.selected];
    this.selected = [...tokens];
    this.emit("token_select", [previous, tokens]);
  }

  public clearSelected() {
    this.selectTokens([]);
  }

  public getSelected(): Token[] {
    return [...this.selected];
  }

  public setMe(user: User) {
    this.myId = user.id;
    this.setUser(user);
  }

  public getMe(): User {
    return this.users[this.myId];
  }

  public setUser(user: User) {
    if (user.id in this.users) this.users[user.id] = user;
    else this.users[user.id] = user;
    this.emit("user_change", user);
  }

  public setUsers(users: User[]) {
    for (const user of users) {
      this.setUser(user);
    }
  }

  public getGrid(): Grid {
    return this.grid;
  }

  public setGrid(grid: GridData) {
    this.grid.size = grid.size;
    this.grid.offset.x = grid.offset.x;
    this.grid.offset.y = grid.offset.y;
    this.emit("grid_change", this.grid);
  }

  public getViewport(): Viewport {
    return this.viewport;
  }
}

export default State;
