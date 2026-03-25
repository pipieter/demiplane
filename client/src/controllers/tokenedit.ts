import type { Token } from "../models/token";
import type { Transform } from "../models/transform";
import type State from "../state";
import type Store from "../store";
import type TokenEditView from "../views/tokenedit";
import Controller from "./controller";

class TokenEditController extends Controller<TokenEditView> {
  constructor(store: Store, state: State, view: TokenEditView) {
    super(store, state, view);

    this.state.listen("token_select", ([_, selected]) => this.view.select(selected));
    this.state.listen("token_transform", ([_, transform]) => this.view.update(transform));

    this.view.listen("token_transform", (transform) => this.ontransform(transform));
    this.view.listen("tokens_delete", (tokens) => this.ondelete(tokens));
  }

  private ontransform(transform: Transform) {
    this.state.transformToken(transform);
    this.store.send({ type: "request_transform", transform });
  }

  private ondelete(tokens: Token[]) {
    const ids = tokens.map((token) => token.id);
    this.state.removeTokens(ids);
    this.store.send({ type: "request_delete", delete: tokens.map((token) => token.id) });
  }
}

export default TokenEditController;
