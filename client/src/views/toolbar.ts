class ToolbarView {
  private readonly toolbar: HTMLElement;
  private selected: string | null;
  private sections: HTMLElement[];
  private buttons: HTMLButtonElement[];

  public readonly settingsSection: HTMLElement;
  public readonly drawSection: HTMLElement;
  public readonly boardSection: HTMLElement;
  public readonly menus: HTMLElement[];

  constructor() {
    this.toolbar = document.querySelector<HTMLElement>(".toolbar")!;
    this.selected = null;
    this.settingsSection = document.getElementById("toolbar-settings")!;
    this.drawSection = document.getElementById("toolbar-draw")!;
    this.boardSection = document.getElementById("toolbar-board")!;
    this.sections = [this.settingsSection, this.drawSection, this.boardSection];
    this.buttons = this.sections.flatMap((section) => {
      const collection = section.getElementsByClassName("toolbar-button");
      return Array.from(collection) as HTMLButtonElement[];
    });
    this.menus = Array.from(document.getElementsByClassName("toolbar-menu")) as HTMLElement[];
    this.buttons.forEach((button, _) => {
      button.addEventListener("click", () => {
        this.select(button);
      });
    });

    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") this.hideAll();
    });

    this.hideAll();
  }

  private hideAll() {
    this.selected = null;
    this.toolbar.classList.remove("menu-open");

    for (const button of this.buttons) {
      button.classList.remove("selected");
    }

    for (const tab of this.menus) {
      tab.style.display = "none";
    }
  }

  private select(button: HTMLButtonElement) {
    const tab = button.getAttribute("data-tab");
    const wasSelected = this.selected === tab;

    this.hideAll();

    if (wasSelected) return;

    this.selected = tab;
    const active = document.querySelector("#tab-" + tab) as HTMLElement;

    if (this.selected === null || active === null) {
      return;
    }

    active.hidden = false;
    active.style.display = "";
    button?.classList.add("selected");
    this.toolbar.classList.add("menu-open");
  }
}

export default ToolbarView;
