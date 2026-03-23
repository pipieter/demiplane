import type State from "../state";
import type Store from "../store";
import type TokenEditView from "../views/tokenedit";
import Controller from "./controller";

class TokenEditController extends Controller<TokenEditView> {
  constructor(store: Store, state: State, view: TokenEditView) {
    super(store, state, view);

    this.state.listen("token_select", ([_, selected]) => this.view.select(selected));
    this.state.listen("token_transform", ([_, transform]) => this.view.update(transform));

    this.view.listen("token_transform", (transform) =>
      this.store.send({
        type: "request_transform",
        transform,
      }),
    );

    this.view.listen("tokens_delete", (tokens) =>
      this.store.send({
        type: "request_delete",
        delete: tokens.map((token) => token.id),
      }),
    );
  }
}

export default TokenEditController;
