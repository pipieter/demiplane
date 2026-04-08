import { Listener } from "../listener";
import type Grid from "../models/grid";
import type { Point } from "../models/transform";
import type { User } from "../models/user";

interface UserCursorsMap {
  cursor_change: Point | null;
}

class UserCursorsView extends Listener<UserCursorsMap> {
  public readonly layer: HTMLElement;
  private readonly grid: Grid;

  constructor(grid: Grid) {
    super();
    this.grid = grid;
    this.layer = document.getElementById("user-cursors") as unknown as HTMLElement;

    document.body.addEventListener("pointermove", (evt) => {
      const position = this.grid.getCoordinates(evt);
      this.emit("cursor_change", position);
    });

    document.body.addEventListener("pointerout", () => {
      this.emit("cursor_change", null);
    });
  }

  renderUserCursor(user: User) {
    const id = `cursor-${user.id}`;
    let cursor = document.getElementById(id);
    if (!cursor) {
      cursor = document.createElement("i");
      cursor.id = id;
      cursor.classList.add("fa-solid", "fa-arrow-pointer", "cursor");
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
