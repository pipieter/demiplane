import type { User } from "../models/user";

class UserCursorsView {
  public readonly layer: HTMLElement;

  constructor() {
    this.layer = document.getElementById("user-cursors") as unknown as HTMLElement;
  }

  renderUserCursor(user: User) {
    const id = `cursor-${user.id}`;
    let cursor = document.getElementById(id);
    if (!cursor) {
      cursor = document.createElement("i");
      cursor.id = id;
      cursor.classList.add("fa-solid", "fa-arrow-pointer", "cursor", "smooth-transform");
      this.layer.appendChild(cursor);
    }

    if (!user.cursorPosition) {
      cursor.style.opacity = "0";
      return;
    }

    const { x, y } = user.cursorPosition;
    cursor.style.opacity = "0.7";
    cursor.style.color = user.color;
    cursor.style.transform = `translate(${x}px, ${y}px)`;
  }
}

export default UserCursorsView;
