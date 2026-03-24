import type State from "../state";
import type Store from "../store";
import type SelectionView from "../views/selection";
import Controller from "./controller";

class SelectionController extends Controller<SelectionView> {
  constructor(store: Store, state: State, view: SelectionView) {
    super(store, state, view);

    this.state.listen("token_select", ([previous, current]) => this.view.select(previous, current));
    this.view.listen("tokens_select", (tokens) => this.state.selectTokens(tokens));
    this.view.listen("tokens_delete", (tokens) => {
      const ids = tokens.map((token) => token.id);
      this.store.send({ type: "request_delete", delete: ids });
    });
  }
}

export default SelectionController;
