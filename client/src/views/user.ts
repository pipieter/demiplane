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

  constructor() {
    super(new UserViewListeners());

    this.nameInput = document.getElementById("user-input-name") as HTMLInputElement;
    this.colorInput = document.getElementById("user-input-color") as HTMLInputElement;

    this.nameInput.onchange = () => this.onchange();
    this.colorInput.onchange = () => this.onchange();
  }

  private onchange() {
    console.log(this.nameInput.value, this.colorInput.value);
    this.set();
  }

  private set() {
    const color = this.colorInput.value;
    document.documentElement.style.setProperty("--user-color", color);
  }
}

export default UserView;
