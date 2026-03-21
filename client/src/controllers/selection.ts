import type State from "../state";
import type Store from "../store";
import type TokenView from "../views/token";

class SelectionController {
  private store: Store;
  private state: State;
  private view: TokenView;

  constructor(store: Store, state: State, view: TokenView) {
    this.store = store;
    this.state = state;
    this.view = view;

    this.view.listen("select_tokens", (ids) => this.select(ids));
  }

  private select(ids: string[]) {
    this.state.selectTokens(ids);
  }
}

export default SelectionController;
