import { TokenListener } from "../listeners";
import type { Token } from "../models/token";

class TokenListView extends TokenListener {
  private list: HTMLUListElement;
  private checkbox: HTMLInputElement;

  constructor() {
    super();

    this.list = document.getElementById("token-list") as HTMLUListElement;
    this.checkbox = document.getElementById("token-list-checkbox") as HTMLInputElement;

    this.checkbox.addEventListener("change", () => this.updateVisibility());
    this.updateVisibility();
  }

  private updateVisibility() {
    if (this.checkbox.checked) {
      this.list.style.display = "";
    } else {
      this.list.style.display = "none";
    }
  }

  public update(tokens: Token[], selected: Token[]) {
    this.list.replaceChildren();

    // Reverse the array, so the top-most tokens are at the top of the list
    const reversed = [...tokens].reverse();
    for (const token of reversed) {
      this.list.appendChild(this.createListEntry(token, selected.includes(token)));
    }
  }

  private createListEntry(token: Token, selected: boolean) {
    const li = document.createElement("li");
    li.id = `token-list-item-${token.id}`;
    li.addEventListener("click", () => this.onselect(token));

    if (selected) {
      li.classList.add("selected");
    }

    const symbols = {
      rectangle: "fa-square",
      circle: "fa-circle",
      text: "fa-a",
      image: "fa-image",
      line: "fa-minus",
    };
    const iconSymbol = symbols[token.type] ?? ["fa-solid", "fa-question"];
    const iconWeight = "border" in token ? (token.border ? "fa-regular" : "fa-solid") : "fa-solid";
    const iconElement = document.createElement("i");
    iconElement.classList.add(iconSymbol, iconWeight);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = token.name;
    nameInput.classList.add("token-name-input");

    nameInput.addEventListener("click", (e) => e.stopPropagation());

    nameInput.addEventListener("change", () => {
      this.onRename(token, nameInput.value);
    });

    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") nameInput.blur(); // Trigger change-event
    });

    li.appendChild(iconElement);
    li.appendChild(nameInput);

    return li;
  }

  private onselect(token: Token) {
    this.emit("tokens_select", [token]);
  }

  private onRename(token: Token, name: string) {
    name = name.trim();

    if (!name) return;
    if (token.name === name) return;

    this.emit("token_transform", {
      id: token.id,
      name,
      x: token.x,
      y: token.y,
      h: token.h,
      w: token.w,
      r: token.r,
    });
  }
}

export default TokenListView;
