import type { Transform } from "../models/transform";
import type State from "../state";
import type Store from "../store";
import type TransformView from "../views/transform";
import Controller from "./controller";

class TransformController extends Controller<TransformView> {
  constructor(store: Store, state: State, view: TransformView) {
    super(store, state, view);

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
