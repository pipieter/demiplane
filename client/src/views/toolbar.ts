class ToolbarView {
  private selected: string | null;
  private sections: HTMLElement[];
  private buttons: HTMLButtonElement[];

  public readonly settingsSection: HTMLElement;
  public readonly drawSection: HTMLElement;
  public readonly boardSection: HTMLElement;
  public readonly menus: HTMLElement[];

  constructor() {
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

    this.hideAll();
  }

  private hideAll() {
    for (const tab of this.menus) {
      tab.style.display = "none";
    }
  }

  private select(button: HTMLButtonElement) {
    const tab = button.getAttribute("data-tab");
    for (const button of this.buttons) {
      button.classList.remove("selected");
    }

    this.hideAll();

    this.selected = tab;
    const active = document.querySelector("#tab-" + tab) as HTMLElement;

    if (this.selected === null || active === null) {
      return;
    }

    active.hidden = false;
    active.style.display = "";
    button?.classList.add("selected");
  }
}

export default ToolbarView;
