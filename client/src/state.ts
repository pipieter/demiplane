import { Listener } from "./listener";
import Background from "./models/background";
import Grid, { type GridData } from "./models/grid";
import type { Token } from "./models/token";
import type { Transform } from "./models/transform";
import type { User } from "./models/user";
import Viewport from "./models/viewport";

export interface StateListenerMap {
  background_change: Background;
  grid_change: GridData;
  user_change: User;
  user_disconnect: string;
  token_create: Token;
  token_select: [Token[], Token[]];
  token_transform: [Token, Transform];
  token_delete: string[];
  token_layer_change: [Token, number];
}

class State extends Listener<StateListenerMap> {
  private tokens: Token[];
  private selected: Token[];
  private users: Record<string, User>;
  private myId: string;
  private background: Background;
  public readonly grid: Grid;
  private viewport: Viewport;

  constructor() {
    super();

    this.tokens = [];
    this.selected = [];
    this.users = {};
    this.myId = "";
    this.viewport = new Viewport();
    this.grid = new Grid(this.viewport);
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

  public clearTokens() {
    const ids = this.tokens.map((token) => token.id);
    this.removeTokens(ids);
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
      token.name = transform.name;
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

  public getTokens(): Token[] {
    return [...this.tokens];
  }

  public setMe(user: User) {
    this.myId = user.id;
    this.setUser(user);
  }

  public getMe(): User {
    return this.users[this.myId];
  }

  public isMe(user: User): boolean {
    return user.id === this.myId;
  }

  public setUser(user: User) {
    if (user.id in this.users) this.users[user.id] = user;
    else this.users[user.id] = user;
    this.emit("user_change", user);
  }

  public removeUser(id: string) {
    if (!(id in this.users)) return;
    delete this.users[id];
    this.emit("user_disconnect", id);
  }

  public setUsers(users: User[]) {
    for (const user of users) {
      this.setUser(user);
    }
  }

  public setGrid(grid: GridData) {
    this.grid.size = grid.size;
    this.grid.offset.x = grid.offset.x;
    this.grid.offset.y = grid.offset.y;
    this.emit("grid_change", this.grid);
  }

  public setDefaultGridLocked(locked: boolean) {
    this.grid.defaultLocked = locked;
  }

  public getViewport(): Viewport {
    return this.viewport;
  }

  public setTokenLayer(id: string, layer: number) {
    const token = this.tokens.find((token) => token.id === id);
    if (!token) return;

    let index = this.tokens.indexOf(token);
    index = Math.max(index, 0);
    index = Math.min(index, this.tokens.length - 1);

    const tokens = [...this.tokens];
    tokens.splice(index, 1); // Remove the token
    tokens.splice(layer, 0, token); // Insert the token at the layer

    this.tokens = tokens;

    this.emit("token_layer_change", [token, layer]);
  }
}

export default State;
