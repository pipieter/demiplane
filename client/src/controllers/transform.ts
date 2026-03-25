import type { Transform } from "../models/transform";
import type State from "../state";
import type Store from "../store";
import type TransformView from "../views/transform";
import Controller from "./controller";

class TransformController extends Controller<TransformView> {
  constructor(store: Store, state: State, view: TransformView) {
    super(store, state, view);

    this.view.listen("tokens_select", (tokens) => this.state.selectTokens(tokens));
    this.view.listen("token_transform", (transform) => this.ontransform(transform));

    this.state.listen("token_select", ([_, selected]) => this.view.setSelected(selected));
    this.state.listen("token_create", (token) => this.view.makeDraggable(token));
    // It is possible for someone else to transform our current selection. In this case
    // we need to update our selection box, just to make sure.
    this.state.listen("token_transform", () => {
      const selected = this.state.getSelected();
      this.view.setSelected(selected);
    });
  }

  private ontransform(transform: Transform) {
    this.store.send({
      type: "request_transform",
      transform,
    });
  }
}

export default TransformController;
