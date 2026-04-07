import type { Point } from "../models/transform";
import type State from "../state";
import type Store from "../store";
import type UserCursorsView from "../views/usercursors";
import Controller from "./controller";

class UserCursorController extends Controller<UserCursorsView> {
  private readonly timeBetweenMessages = 50; // in milliseconds
  private timeSinceLastMessage: number;

  constructor(store: Store, state: State, view: UserCursorsView) {
    super(store, state, view);
    this.timeSinceLastMessage = 0;

    this.state.listen("user_change", (user) => {
      if (this.state.isMe(user)) return;
      this.view.renderUserCursor(user);
    });

    document.body.addEventListener("pointermove", (evt) => {
      this.updatePosition(evt);
    });

    document.body.addEventListener("pointerout", (evt) => {
      this.hidePosition(evt);
    });
  }

  private emitPosition(position: Point | null) {
    const now = Date.now();
    if (now - this.timeSinceLastMessage < this.timeBetweenMessages) {
      return;
    }
    this.timeSinceLastMessage = now;

    const secret = this.store.getSecretToken();
    if (!secret) return;

    this.store.send({
      type: "request_user_position",
      user: { secret, position },
    });
  }

  updatePosition(evt: MouseEvent) {
    const position = this.state.grid.getCoordinates(evt);
    this.emitPosition(position);
  }

  hidePosition(_evt: MouseEvent) {
    this.emitPosition(null);
  }
}

export default UserCursorController;
