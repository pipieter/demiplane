import type { Transform } from "../models/transform";
import type State from "../state";
import type Store from "../store";
import type TransformView from "../views/transform";

class TransformController {
  private store: Store;
  private state: State;
  private view: TransformView;

  constructor(store: Store, state: State, transformView: TransformView) {
    this.store = store;
    this.state = state;
    this.view = transformView;

    this.view.listen("tokens_select", (ids) => this.select(ids));
    this.view.listen("token_transform", (transform) => this.ontransform(transform));
    this.state.listen("token_create", (token) => this.view.makeDraggable(token));
  }

  private select(ids: string[]) {
    this.state.selectTokens(ids);
  }

  private ontransform(transform: Transform) {
    this.store.send({
      type: "request_transform",
      transform,
    });
  }
}

export default TransformController;
