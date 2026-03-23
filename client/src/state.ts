import { Listener, ListenerContainer } from "./listener";
import Background from "./models/background";
import Grid, { type GridData } from "./models/grid";
import type { Token } from "./models/token";
import type { Transform } from "./models/transform";
import Viewport from "./models/viewport";

interface StateListenerMap {
  background_change: Background;
  grid_change: GridData;
  token_create: Token;
  token_select: [string[], string[]];
  token_transform: [Token, Transform];
  token_delete: string[];
}

class StateListeners extends Listener<StateListenerMap> {
  protected override keys(): (keyof StateListenerMap)[] {
    return ["background_change", "grid_change", "token_create", "token_select", "token_transform", "token_delete"];
  }
}

class State extends ListenerContainer<StateListeners, StateListenerMap> {
  private tokens: Token[];
  private selected: string[];
  private background: Background;
  private grid: Grid;
  private viewport: Viewport;

  constructor() {
    super(new StateListeners());

    this.tokens = [];
    this.selected = [];
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
    this.selected = this.selected.filter((id) => !ids.includes(id));
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
      this.emit("token_transform", [token, transform]);
    }
  }

  public selectTokens(ids: string[]) {
    const previous = [...this.selected];
    this.selected = [...ids];
    this.emit("token_select", [previous, ids]);
  }

  public clearSelected() {
    this.selectTokens([]);
  }

  public getSelected(): string[] {
    return [...this.selected];
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
