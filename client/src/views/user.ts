import { Listener, ListenerContainer } from "../listener";
import type { User } from "../models/user";

interface UserViewMap {
  user_change: User;
}

class UserViewListeners extends Listener<UserViewMap> {
  protected override keys(): (keyof UserViewMap)[] {
    return ["user_change"];
  }
}

class UserView extends ListenerContainer<UserViewListeners, UserViewMap> {
  private nameInput: HTMLInputElement;
  private colorInput: HTMLInputElement;
  private me: User;

  constructor() {
    super(new UserViewListeners());

    this.nameInput = document.getElementById("user-input-name") as HTMLInputElement;
    this.colorInput = document.getElementById("user-input-color") as HTMLInputElement;
    this.me = { id: "e", name: "steve", color: "#FF00FF" };

    this.nameInput.onchange = () => this.onchange();
    this.colorInput.onchange = () => this.onchange();
  }

  private onchange() {
    console.log(this.nameInput.value, this.colorInput.value);
    this.me.name = this.nameInput.value;
    this.me.color = this.colorInput.value;
  }

  set(user: User) {
    console.log(user);
    if (user.id === this.me.id) {
      this.nameInput.value = user.name;
      this.colorInput.value = user.color;
      document.documentElement.style.setProperty("--user-color", user.color);
    }
  }
}

export default UserView;
