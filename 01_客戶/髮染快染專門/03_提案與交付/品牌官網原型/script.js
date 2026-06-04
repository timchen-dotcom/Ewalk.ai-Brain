const toggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-site-nav]");

toggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});
