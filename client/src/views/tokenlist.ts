import { TokenListenerContainer } from "../listeners";
import type { Token } from "../models/token";

class TokenListView extends TokenListenerContainer {
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
      line: "fa-slash",
    };
    const iconSymbol = symbols[token.type] ?? ["fa-solid", "fa-question"];
    const iconWeight = "border" in token ? (token.border ? "fa-regular" : "fa-solid") : "fa-regular";
    const name = `Unnamed ${token.type}`; // TODO give tokens a name

    const iconElement = document.createElement("i");
    const nameElement = document.createElement("p");

    iconElement.classList.add(iconSymbol, iconWeight);
    nameElement.innerText = name;

    li.appendChild(iconElement);
    li.appendChild(nameElement);

    return li;
  }

  private onselect(token: Token) {
    this.emit("tokens_select", [token]);
  }
}

export default TokenListView;
