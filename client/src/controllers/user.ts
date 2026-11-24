import type State from "../state";
import type Store from "../store";
import type { User } from "../models/user";
import type UserView from "../views/user";
import Controller from "./controller";

class UserController extends Controller<UserView> {
  private me: User | null = null;
  private discordName: string | null = null;
  private discordNameApplied = false;

  constructor(store: Store, state: State, view: UserView) {
    super(store, state, view);

    this.view.listen("user_change", ({ name, color }) => this.onchange(name, color));
    this.state.listen("user_change", (user) => {
      const isMe = this.state.isMe(user);
      if (isMe) {
        this.me = user;
        this.view.setMe(user);
        this.applyDiscordName(user);
      }
      this.view.set(user, isMe);
    });
    this.state.listen("user_disconnect", (userId) => {
      this.view.delete(userId);
    });
  }

  public setDiscordName(name: string) {
    this.discordName = name;
    if (this.me) this.applyDiscordName(this.me);
  }

  private applyDiscordName(user: User) {
    if (
      this.discordNameApplied ||
      !this.discordName ||
      this.discordName === user.name ||
      !/^Wanderer \d+$/.test(user.name)
    ) {
      return;
    }

    this.discordNameApplied = true;
    this.onchange(this.discordName, user.color);
  }

  private onchange(name: string, color: string) {
    const secret = this.store.getSecretToken();
    if (!secret) {
      this.store.send({ type: "request_sync", secret: null });
      return;
    }

    // Note: we don't set the state here because the backend needs to do some required
    // processing that cannot be skipped. Instead, we rely on the backend to respond with
    // the correct message
    this.store.send({ type: "request_user_change", user: { secret, name, color } });
  }
}

export default UserController;
