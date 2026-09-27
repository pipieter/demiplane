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

    this.buttons.forEach((button, _) => {
      button.addEventListener("click", () => {
        this.select(button);
      });
    });
  }

  private select(button: HTMLButtonElement) {
    const tab = button.getAttribute("data-tab");
    for (const button of this.buttons) {
      button.classList.remove("selected");
    }

    // TODO hide menus
    // for (const tab of this.tabs) {
    //     tab.hidden = true;
    // }

    this.selected = tab;
    const active = document.querySelector("#tab-" + tab) as HTMLElement;
    console.log(active);

    // TODO Show menu
    // if (this.selected === null || active === null) {
    //     this.content.classList.remove("visible");
    //     return;
    // }

    active.hidden = false;
    // this.content.classList.add("visible");
    button?.classList.add("selected");
  }
}

export default ToolbarView;
