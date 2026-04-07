import type State from "../state";
import type Store from "../store";
import type SelectionView from "../views/selection";
import { TokenController } from "./controller";

class SelectionController extends TokenController<SelectionView> {
  constructor(store: Store, state: State, view: SelectionView) {
    super(store, state, view);

    this.state.listen("token_select", ([previous, current]) => this.view.select(previous, current));
  }
}

export default SelectionController;
