// No ListenerContainer necessary for this class as it's purely DOM manipulation

class HeaderView {
  private tabs: HTMLElement[];
  private tabButtons: HTMLButtonElement[];

  constructor() {
    this.tabs = [...document.querySelectorAll(".tab-panel")] as HTMLElement[];
    this.tabButtons = [...document.querySelectorAll(".tab-button")] as HTMLButtonElement[];

    this.tabButtons.forEach((button) => {
      button.addEventListener("click", () => this.select(button.getAttribute("data-tab")));
    });
  }

  private select(tab: string | null) {
    for (const tab of this.tabs) {
      tab.hidden = true;
    }

    const active = document.querySelector("#tab-" + tab) as HTMLElement;
    if (!active) {
      throw `Unknown tab '${tab}'!`;
    }

    active.hidden = false;
  }
}

export default HeaderView;
