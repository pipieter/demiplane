import type { Token } from "../models/token";
import type State from "../state";
import type Store from "../store";
import type TokenView from "../views/token";
import Controller from "./controller";

class TokenController extends Controller<TokenView> {
  constructor(store: Store, state: State, view: TokenView) {
    super(store, state, view);

    this.state.listen("token_create", (token) => this.create(token));
    this.state.listen("token_transform", ([token, _]) => this.redraw(token));
    this.state.listen("token_delete", (ids) => this.remove(ids));
    this.view.listen("request_remove", () => this.requestRemove());
  }

  public create(token: Token) {
    this.view.create(token);
  }

  public redraw(token: Token) {
    this.view.redraw(token);
  }

  public remove(ids: string[]) {
    this.view.remove(ids);
  }

  public requestRemove() {
    const ids = this.state.getSelected().map((token) => token.id);
    this.store.send({ type: "request_delete", delete: ids });
  }
}

export default TokenController;
