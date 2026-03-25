import type { Token } from "../models/token";
import type State from "../state";
import type Store from "../store";
import type SelectionView from "../views/selection";
import Controller from "./controller";

class SelectionController extends Controller<SelectionView> {
  constructor(store: Store, state: State, view: SelectionView) {
    super(store, state, view);

    this.state.listen("token_select", ([previous, current]) => this.view.select(previous, current));
    this.view.listen("tokens_select", (tokens) => this.state.selectTokens(tokens));
    this.view.listen("tokens_delete", (tokens) => this.ondelete(tokens));
  }

  private ondelete(tokens: Token[]) {
    const ids = tokens.map((token) => token.id);
    this.state.removeTokens(ids);
    this.store.send({ type: "request_delete", delete: ids });
  }
}

export default SelectionController;
