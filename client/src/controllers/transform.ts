import type State from "../state";
import type Store from "../store";
import type TransformView from "../views/transform";
import { TokenController } from "./controller";

class TransformController extends TokenController<TransformView> {
  constructor(store: Store, state: State, view: TransformView) {
    super(store, state, view);

    this.state.listen("token_select", ([_, selected]) => this.view.setSelected(selected));
    this.state.listen("token_create", (token) => this.view.makeDraggable(token));
    // It is possible for someone else to transform our current selection. In this case
    // we need to update our selection box, just to make sure.
    this.state.listen("token_transform", () => {
      const selected = this.state.getSelected();
      this.view.setSelected(selected);
    });
  }
}

export default TransformController;
