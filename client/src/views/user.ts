import { Listener, ListenerContainer } from "../listener";
import type { User } from "../models/user";

interface UserViewMap {
  user_change: { name: string; color: string };
}

class UserViewListeners extends Listener<UserViewMap> {
  protected override keys(): (keyof UserViewMap)[] {
    return ["user_change"];
  }
}

class UserView extends ListenerContainer<UserViewListeners, UserViewMap> {
  private nameInput: HTMLInputElement;
  private colorInput: HTMLInputElement;
  private userList: HTMLUListElement;

  constructor() {
    super(new UserViewListeners());

    this.nameInput = document.getElementById("user-input-name") as HTMLInputElement;
    this.colorInput = document.getElementById("user-input-color") as HTMLInputElement;
    this.userList = document.getElementById("user-list") as HTMLUListElement;

    this.nameInput.onchange = () => this.onchange();
    this.colorInput.onchange = () => this.onchange();
  }

  private onchange() {
    this.emit("user_change", { name: this.nameInput.value, color: this.colorInput.value });
  }

  setMe(user: User) {
    this.nameInput.value = user.name;
    this.colorInput.value = user.color;
    document.documentElement.style.setProperty("--user-color", user.color);
  }

  set(user: User) {
    const id = `user-${user.id}`;
    const existingItem = this.userList.querySelector(`#${id}`) as HTMLLIElement | null;
    if (existingItem) {
      existingItem.textContent = user.name;
      existingItem.style.color = user.color;
      return;
    }

    const li = document.createElement("li");
    li.id = id;
    li.textContent = user.name;
    li.style.color = user.color;
    this.userList.appendChild(li);
  }
}

export default UserView;
