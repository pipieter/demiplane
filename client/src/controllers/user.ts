import type State from "../state";
import type Store from "../store";
import type UserView from "../views/user";
import Controller from "./controller";

class UserController extends Controller<UserView> {
  constructor(store: Store, state: State, view: UserView) {
    super(store, state, view);

    this.view.listen("user_change", ({ name, color }) => this.onchange(name, color));
    this.state.listen("user_change", (user) => {
      const me = this.state.getMe();
      if (me && user.id === me.id) this.view.setMe(user);
      this.view.set(user);
    });
  }

  private onchange(name: string, color: string) {
    const bearer = this.store.getBearerToken();

    if (!bearer) {
      this.store.send({ type: "request_sync", bearer: null });
      return;
    }

    this.store.send({
      type: "request_user",
      user: {
        bearer,
        name,
        color,
      },
    });
  }
}

export default UserController;
