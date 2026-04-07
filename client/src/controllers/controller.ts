import type { TokenListener } from "../listeners";
import type { Token } from "../models/token";
import type { Transform } from "../models/transform";
import type State from "../state";
import type Store from "../store";

abstract class Controller<View> {
  protected store: Store;
  protected state: State;
  protected view: View;

  constructor(store: Store, state: State, view: View) {
    this.store = store;
    this.state = state;
    this.view = view;
  }
}

export abstract class TokenController<View extends TokenListener> extends Controller<View> {
  constructor(store: Store, state: State, view: View) {
    super(store, state, view);

    this.view.listen("tokens_select", (tokens) => this.onselect(tokens));
    this.view.listen("tokens_delete", (tokens) => this.ondelete(tokens));
    this.view.listen("token_transform", (transform) => this.ontransform(transform));
    this.view.listen("token_transform_finish", (transform) => this.ontransform(transform));
    this.view.listen("token_layer_change", ([token, layer]) => this.onlayerchange(token, layer));
  }

  protected ontransform(transform: Transform) {
    this.state.transformToken(transform);
    this.store.send({ type: "request_transform", transform });
  }

  protected ondelete(tokens: Token[]) {
    const ids = tokens.map((token) => token.id);
    this.state.removeTokens(ids);
    this.store.send({ type: "request_delete", delete: tokens.map((token) => token.id) });
  }

  protected onlayerchange(token: Token, layer: number) {
    this.state.setTokenLayer(token.id, layer);
    this.store.send({ type: "request_layer_change", tokenId: token.id, layer });
  }

  protected onselect(tokens: Token[]) {
    this.state.selectTokens(tokens);
  }
}

export default Controller;
