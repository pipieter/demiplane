import type State from "../state";
import type Store from "../store";
import type HeaderView from "../views/header";
import Controller from "./controller";

class HeaderController extends Controller<HeaderView> {
  constructor(store: Store, state: State, view: HeaderView) {
    super(store, state, view);
  }
}

export default HeaderController;
