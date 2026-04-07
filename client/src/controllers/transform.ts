import type { Transform } from "../models/transform";
import type State from "../state";
import type Store from "../store";
import type TransformView from "../views/transform";
import { TokenController } from "./controller";

class TransformController extends TokenController<TransformView> {
  private readonly timeBetweenMessages = 50; // in milliseconds
  private timeSinceLastMessage: number;

  constructor(store: Store, state: State, view: TransformView) {
    super(store, state, view);

    this.timeSinceLastMessage = 0;

    this.state.listen("token_select", ([_, selected]) => this.view.setSelected(selected));
    this.state.listen("token_create", (token) => this.view.makeDraggable(token));
    // It is possible for someone else to transform our current selection. In this case
    // we need to update our selection box, just to make sure.
    this.state.listen("token_transform", () => {
      const selected = this.state.getSelected();
      this.view.setSelected(selected);
    });
  }

  protected override ontransform(transform: Transform, force?: boolean) {
    // The transform controller listens to when the user moves a token on the map.
    // In order to not spam the server, messages are sent once every so often, rather
    // than continuously.

    this.state.transformToken(transform);

    const now = Date.now();
    if (now - this.timeSinceLastMessage < this.timeBetweenMessages && !force) {
      return;
    }

    this.timeSinceLastMessage = now;
    this.store.send({ type: "request_transform", transform });
  }
}

export default TransformController;
