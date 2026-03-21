import type State from "../state";
import type Store from "../store";

abstract class Controller<View> {
  protected store: Store;
  protected state: State;
  protected view: View;

  constructor(store: Store, state: State, view: View) {
    this.store = store;
    this.state = state;
    this.view = view;
  }
}

export default Controller;
