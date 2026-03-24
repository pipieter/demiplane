// No ListenerContainer necessary for this class as it's purely DOM manipulation

class SidebarView {
  private selected: string | null; // Hidden if null
  private tabs: HTMLElement[];
  private content: HTMLElement;
  private hideButton: HTMLButtonElement;
  private tabButtons: HTMLButtonElement[];

  constructor() {
    this.selected = null;
    this.tabs = [...document.querySelectorAll(".tab-panel")] as HTMLElement[];
    this.content = document.getElementById("sidebar-content") as HTMLElement;
    this.hideButton = document.getElementById("sidebar-hide-button") as HTMLButtonElement;
    this.tabButtons = [...document.querySelectorAll(".tab-button")] as HTMLButtonElement[];

    this.tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.select(button, button.getAttribute("data-tab"));
      });
    });
    this.hideButton.addEventListener("click", () => this.select(null, null));
  }

  private select(button: HTMLButtonElement | null, tab: string | null) {
    for (const button of this.tabButtons) {
      button.classList.remove("selected");
    }

    for (const tab of this.tabs) {
      tab.hidden = true;
    }

    this.selected = tab;
    const active = document.querySelector("#tab-" + tab) as HTMLElement;

    if (this.selected === null || active === null) {
      this.content.classList.remove("visible");
      return;
    }

    active.hidden = false;
    this.content.classList.add("visible");
    button?.classList.add("selected");
  }
}

export default SidebarView;
