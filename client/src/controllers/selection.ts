import type { Token } from "../models/token";
import type State from "../state";
import type Store from "../store";
import type SelectionView from "../views/selection";
import Controller from "./controller";

class SelectionController extends Controller<SelectionView> {
  constructor(store: Store, state: State, view: SelectionView) {
    super(store, state, view);

    this.state.listen("token_select", ([previous, current]) => this.select(previous, current));
    this.view.listen("clear_selection", () => this.clear());
  }

  private select(previous: Token[], current: Token[]) {
    this.view.select(previous, current);
  }

  private clear() {
    this.state.clearSelected();
  }
}

export default SelectionController;
