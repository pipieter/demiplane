import { TokenListener } from "../listeners";
import type { Token } from "../models/token";

class TokenListView extends TokenListener {
  public readonly list: HTMLUListElement;
  public readonly checkbox: HTMLInputElement;

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
    nameInput.maxLength = 36;
    nameInput.minLength = 1;

    nameInput.addEventListener("click", (e) => e.stopPropagation());

    nameInput.addEventListener("change", () => {
      this.onRename(token, nameInput);
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

  private onRename(token: Token, input: HTMLInputElement) {
    const name = input.value.trim();
    if (token.name === name) return;
    if (!name || name.length > input.maxLength || name.length < input.minLength) {
      input.value = token.name;
      return;
    }

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
