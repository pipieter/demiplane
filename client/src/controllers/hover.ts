import type State from "../state";
import type Store from "../store";
import type HoverView from "../views/hover";
import Controller from "./controller";

class HoverController extends Controller<HoverView> {
  constructor(store: Store, state: State, view: HoverView) {
    super(store, state, view);

    this.state.listen("token_create", (token) => this.view.makeHoverable(token));
  }
}

export default HoverController;
