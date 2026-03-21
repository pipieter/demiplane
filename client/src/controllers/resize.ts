import type { Transform } from "../models/transform";
import type State from "../state";
import type Store from "../store";
import type ResizeView from "../views/resize";
import Controller from "./controller";

class ResizeController extends Controller<ResizeView> {
  constructor(store: Store, state: State, view: ResizeView) {
    super(store, state, view);

    this.view.listen("token_transform", (transform) => this.ontransform(transform));
    this.state.listen("token_select", ([_, tokens]) => this.update(tokens));

    // It is possible for someone else to transform our current selection. In this case
    // we need to update our selection box, just to make sure.
    this.state.listen("token_transform", () => {
      const selected = this.state.getSelected();
      this.update(selected);
    });
  }

  private update(ids: string[]) {
    this.view.setSelected(ids);
  }

  private ontransform(transform: Transform) {
    this.store.send({
      type: "request_transform",
      transform,
    });
  }
}

export default ResizeController;
