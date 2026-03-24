import type State from "../state";
import type Store from "../store";
import type SidebarView from "../views/sidebar";
import Controller from "./controller";

class SidebarController extends Controller<SidebarView> {
  constructor(store: Store, state: State, view: SidebarView) {
    super(store, state, view);
  }
}

export default SidebarController;
