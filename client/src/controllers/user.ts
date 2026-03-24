import type State from "../state";
import type Store from "../store";
import type UserView from "../views/user";
import Controller from "./controller";

class UserController extends Controller<UserView> {
  constructor(store: Store, state: State, view: UserView) {
    super(store, state, view);

    this.view.listen("user_change", ({ name, color }) => this.onchange(name, color));
    this.state.listen("user_change", (user) => this.view.set(user));
  }

  private onchange(name: string, color: string) {
    console.log(`controller change! -> ${name} ${color}`);
  }
}

export default UserController;
