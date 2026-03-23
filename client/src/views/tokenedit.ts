import { TokenListenerContainer } from "../listeners";
import type { Token } from "../models/token";
import type { Transform } from "../models/transform";

class TokenEditView extends TokenListenerContainer {
  private editX: HTMLInputElement;
  private editY: HTMLInputElement;
  private editW: HTMLInputElement;
  private editH: HTMLInputElement;
  private editElements: HTMLInputElement[];

  private selected: Token | null;

  constructor() {
    super();

    this.editX = document.getElementById("token-edit-x") as HTMLInputElement;
    this.editY = document.getElementById("token-edit-y") as HTMLInputElement;
    this.editW = document.getElementById("token-edit-w") as HTMLInputElement;
    this.editH = document.getElementById("token-edit-h") as HTMLInputElement;
    this.editElements = [this.editX, this.editY, this.editW, this.editH];

    this.selected = null;

    this.editElements.forEach((input) => input.addEventListener("change", () => this.onchange()));
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
  }

  public disable() {
    this.editElements.forEach((element) => (element.disabled = true));
  }

  public enable(token: Token) {
    this.editElements.forEach((element) => (element.disabled = false));
    this.editX.value = token.x.toString();
    this.editY.value = token.y.toString();
    this.editW.value = token.w.toString();
    this.editH.value = token.h.toString();
  }

  public onchange() {
    if (!this.selected) return;

    console.log("AAAAAAA");
    const id = this.selected.id;
    const x = parseInt(this.editX.value ?? "0");
    const y = parseInt(this.editY.value ?? "0");
    const w = parseInt(this.editW.value ?? "8");
    const h = parseInt(this.editH.value ?? "8");
    console.log(x, y, w, h);
    this.emit("token_transform", { id, x, y, w, h });
  }
}

export default TokenEditView;
