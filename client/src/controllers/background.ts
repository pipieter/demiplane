import type Background from "../models/background";
import type State from "../state";
import type Store from "../store";
import type BackgroundView from "../views/background";
import Controller from "./controller";

class BackgroundController extends Controller<BackgroundView> {
  constructor(store: Store, state: State, view: BackgroundView) {
    super(store, state, view);

    this.state.listen("background_change", (background) => this.update(background));
  }

  public update(background: Background) {
    this.view.set(background.href, background.width, background.height);
  }
}

export default BackgroundController;
