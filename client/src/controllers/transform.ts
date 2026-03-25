import type { Transform } from "../models/transform";
import type State from "../state";
import type Store from "../store";
import type TransformView from "../views/transform";
import Controller from "./controller";

class TransformController extends Controller<TransformView> {
  private readonly timeBetweenMessages = 100; // in milliseconds
  private timeSinceLastMessage: number;

  constructor(store: Store, state: State, view: TransformView) {
    super(store, state, view);

    this.timeSinceLastMessage = 0;

    this.view.listen("tokens_select", (tokens) => this.state.selectTokens(tokens));
    this.view.listen("token_transform", (transform) => this.ontransform(transform, false));
    this.view.listen("token_transform_finish", (transform) => this.ontransform(transform, true));

    this.state.listen("token_select", ([_, selected]) => this.view.setSelected(selected));
    this.state.listen("token_create", (token) => this.view.makeDraggable(token));
    // It is possible for someone else to transform our current selection. In this case
    // we need to update our selection box, just to make sure.
    this.state.listen("token_transform", () => {
      const selected = this.state.getSelected();
      this.view.setSelected(selected);
    });
  }

  private ontransform(transform: Transform, force: boolean) {
    this.state.transformToken(transform);

    const now = Date.now();

    // Don't spam the server, only send messages once every so often
    // If the message is forced, it is sent anyway
    if (now - this.timeSinceLastMessage < this.timeBetweenMessages && !force) {
      return;
    }

    this.timeSinceLastMessage = now;
    this.store.send({ type: "request_transform", transform });
  }
}

export default TransformController;
