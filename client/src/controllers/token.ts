import type { Token } from "../models/token";
import type State from "../state";
import type Store from "../store";
import type TokenView from "../views/token";

class TokenController {
  private store: Store;
  private state: State;
  private view: TokenView;

  constructor(store: Store, state: State, view: TokenView) {
    this.store = store;
    this.state = state;
    this.view = view;

    this.state.listen("token_create", (token) => this.create(token));
  }

  public create(token: Token) {
    this.view.create(token);
  }
}

export default TokenController;
