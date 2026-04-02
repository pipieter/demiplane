import type { Transform } from "../models/transform";
import type { StateListenerMap } from "../state";
import type State from "../state";
import type Store from "../store";
import type TokenListView from "../views/tokenlist";
import Controller from "./controller";

class TokenListController extends Controller<TokenListView> {
  constructor(store: Store, state: State, view: TokenListView) {
    super(store, state, view);

    this.view.listen("tokens_select", (selected) => this.state.selectTokens(selected));
    this.view.listen("token_transform", (transform) => this.onTransform(transform));

    const listens = ["token_delete", "token_create", "token_select", "token_transform"] as (keyof StateListenerMap)[];
    for (const listen of listens) {
      this.state.listen(listen, () => this.view.update(this.state.getTokens(), this.state.getSelected()));
    }
  }

  private onTransform(transform: Transform) {
    this.state.transformToken(transform);
    this.store.send({ type: "request_transform", transform });
  }
}

export default TokenListController;
