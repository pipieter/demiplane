function initialize() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.getAttribute("data-tab");

      document.querySelectorAll(".tab-panel").forEach((panel) => {
        (panel as HTMLElement).hidden = true;
      });

      const activeTab = document.querySelector("#tab-" + tab) as HTMLElement;
      if (!activeTab) throw `Unknown tab ${tab}.`;
      activeTab.hidden = false;
    });
  });
}

export const header = { initialize };
