(() => {
  const root = document.querySelector(".aoi-tools-case");
  const tabs = [...document.querySelectorAll(".aoi-tools-tab")];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
  if (!root || tabs.length !== 3 || panels.some((panel) => !panel)) return;

  const activate = (index, focus = false) => {
    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[position].classList.toggle("is-active", selected);
    });
    if (focus) {
      tabs[index].focus();
      tabs[index].scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  };

  root.classList.add("aoi-tools-enhanced");
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(index));
    tab.addEventListener("keydown", (event) => {
      const next = {
        ArrowRight: (index + 1) % tabs.length,
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      activate(next, true);
    });
  });
  activate(0);
})();
