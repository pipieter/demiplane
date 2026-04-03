import { TokenListener } from "../listeners";
import type { Token } from "../models/token";
import type { Transform } from "../models/transform";

class TokenEditView extends TokenListener {
  private editX: HTMLInputElement;
  private editY: HTMLInputElement;
  private editW: HTMLInputElement;
  private editH: HTMLInputElement;
  private editR: HTMLInputElement;
  private editElements: HTMLInputElement[];
  private deleteButton: HTMLButtonElement;

  private selected: Token | null;

  constructor() {
    super();

    this.editX = document.getElementById("token-edit-x") as HTMLInputElement;
    this.editY = document.getElementById("token-edit-y") as HTMLInputElement;
    this.editW = document.getElementById("token-edit-w") as HTMLInputElement;
    this.editH = document.getElementById("token-edit-h") as HTMLInputElement;
    this.editR = document.getElementById("token-edit-r") as HTMLInputElement;
    this.editElements = [this.editX, this.editY, this.editW, this.editH, this.editR];
    this.deleteButton = document.getElementById("token-edit-delete") as HTMLButtonElement;

    this.selected = null;

    this.editElements.forEach((input) => input.addEventListener("change", () => this.onchange()));
    this.deleteButton.addEventListener("click", () => this.ondelete());
  }

  public select(tokens: Token[]) {
    // Only allow one token to be edited at a time
    if (tokens.length !== 1) {
      this.selected = null;
      this.disable();
      return;
    }

    this.selected = tokens[0];
    this.enable(tokens[0]);
  }

  public update(transform: Transform) {
    if (!this.selected) return;
    if (transform.id !== this.selected.id) return;

    this.editX.value = transform.x.toString();
    this.editY.value = transform.y.toString();
    this.editW.value = transform.w.toString();
    this.editH.value = transform.h.toString();
    this.editR.value = transform.r.toString();
  }

  public disable() {
    this.editElements.forEach((element) => (element.disabled = true));
    this.deleteButton.disabled = true;
  }

  public enable(token: Token) {
    this.editElements.forEach((element) => (element.disabled = false));
    this.deleteButton.disabled = false;
    this.editX.value = token.x.toString();
    this.editY.value = token.y.toString();
    this.editW.value = token.w.toString();
    this.editH.value = token.h.toString();
    this.editR.value = token.r.toString();
  }

  public onchange() {
    if (!this.selected) return;

    const id = this.selected.id;
    const name = this.selected.name;
    const x = parseInt(this.editX.value || "0");
    const y = parseInt(this.editY.value || "0");
    const r = parseInt(this.editR.value || "0");
    let w = parseInt(this.editW.value || "8");
    let h = parseInt(this.editH.value || "8");

    // Don't allow negative dimensions
    w = Math.max(w, 0);
    h = Math.max(h, 0);

    this.emit("token_transform", { id, name, x, y, w, h, r });
  }

  public ondelete() {
    if (!this.selected) return;

    this.emit("tokens_delete", [this.selected]);
  }
}

export default TokenEditView;
