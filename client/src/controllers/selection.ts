import type State from "../state";
import type Store from "../store";
import type SelectionView from "../views/selection";

class SelectionController {
  private store: Store;
  private state: State;
  private view: SelectionView;

  constructor(store: Store, state: State, view: SelectionView) {
    this.store = store;
    this.state = state;
    this.view = view;

    this.state.listen("token_select", ([previous, current]) => this.select(previous, current));
    this.view.listen("clear_selection", () => this.clear());
  }

  private select(previous: string[], current: string[]) {
    this.view.select(previous, current);
  }

  private clear() {
    this.state.selectTokens([]);
  }
}

export default SelectionController;
