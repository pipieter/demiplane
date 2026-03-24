import type { User } from "../models/user";
import type State from "../state";
import type Store from "../store";
import type UserView from "../views/user";
import Controller from "./controller";

class UserController extends Controller<UserView> {
  constructor(store: Store, state: State, view: UserView) {
    super(store, state, view);

    this.view.listen("user_change", (user) => this.onchange(user));
    this.state.listen("user_change", (user) => this.view.set(user));
  }

  private onchange(user: User) {
    this.store.send({
      type: "request_user",
      user
    });
  }
}

export default UserController;
