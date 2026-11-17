document.documentElement.classList.add("js");

const navigation = document.querySelector("#navegacao");
const menuButton = document.querySelector(".menu-toggle");
const menuIcon = menuButton.querySelector("use");

function setMenu(open) {
  navigation.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  menuIcon.setAttribute("href", open ? "#i-close" : "#i-menu");
}

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuButton.focus();
  }
});

for (const tablist of document.querySelectorAll("[data-tabs]")) {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];

  function selectTab(selectedTab) {
    for (const tab of tabs) {
      const selected = tab === selectedTab;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute("aria-controls")).hidden = !selected;
    }
  }

  tablist.addEventListener("click", (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) selectTab(tab);
  });

  tablist.addEventListener("keydown", (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (!tab) return;

    const vertical = tablist.getAttribute("aria-orientation") === "vertical";
    const currentIndex = tabs.indexOf(tab);
    const previousKey = vertical ? "ArrowUp" : "ArrowLeft";
    const nextKey = vertical ? "ArrowDown" : "ArrowRight";
    let nextIndex;

    if (event.key === previousKey) nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === nextKey) nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    selectTab(nextTab);
    nextTab.focus();
  });
}
