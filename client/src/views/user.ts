import { Listener } from "../listener";
import type { User } from "../models/user";

interface UserViewMap {
  user_change: { name: string; color: string };
}

class UserView extends Listener<UserViewMap> {
  private nameInput: HTMLInputElement;
  private colorInput: HTMLInputElement;
  private userList: HTMLUListElement;

  constructor() {
    super();

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

  private listItemId = (id: string) => {
    return `user-${id}`;
  };

  set(user: User, isMe: boolean = false) {
    const id = this.listItemId(user.id);
    const existingItem = this.userList.querySelector(`#${id}`) as HTMLLIElement | null;

    if (existingItem) {
      const nameElement = existingItem.querySelector("p");
      if (nameElement) nameElement.innerText = user.name;
      if (isMe) existingItem.style.backgroundColor = "var(--dark-secondary)";

      existingItem.style.color = user.color;
      return;
    }

    const li = document.createElement("li");
    const iconElement = document.createElement("i");
    const nameElement = document.createElement("p");

    iconElement.classList.add("fa-user", "fa-solid");
    nameElement.innerText = user.name;

    li.id = id;
    li.style.color = user.color;
    li.appendChild(iconElement);
    li.appendChild(nameElement);
    li.style.cursor = "default"; // Currently not clickable.

    this.userList.appendChild(li);
  }

  delete(userId: string) {
    const id = this.listItemId(userId);
    const existingItem = this.userList.querySelector(`#${id}`) as HTMLLIElement | null;
    if (existingItem) existingItem.remove();
  }
}

export default UserView;
