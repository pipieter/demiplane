import type State from "../state";
import type Store from "../store";
import type ToolbarView from "../views/toolbar";
import Controller from "./controller";

class ToolbarController extends Controller<ToolbarView> {
  constructor(store: Store, state: State, view: ToolbarView) {
    super(store, state, view);
  }
}

export default ToolbarController;
