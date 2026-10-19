import { templateCount } from "./presentation";

export function initializeTemplateGallery(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>("form");
  const search = root.querySelector<HTMLInputElement>('[name="q"]');
  const type = root.querySelector<HTMLSelectElement>('[name="type"]');
  const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-template-card]"));
  const count = root.querySelector<HTMLElement>("[data-template-count]");
  const empty = root.querySelector<HTMLElement>("[data-template-empty]");
  const reset = root.querySelector<HTMLButtonElement>('[type="reset"]');
  if (!form || !search || !type || !count || !empty) return;

  const update = () => {
    const words = search.value.trim().toLocaleLowerCase("en").split(/\s+/).filter(Boolean);
    let matches = 0;
    for (const card of cards) {
      const matchesFilters = (!type.value || card.dataset.type === type.value)
        && words.every((word) => card.dataset.search?.includes(word));
      card.hidden = !matchesFilters;
      if (matchesFilters) matches++;
    }
    count.textContent = templateCount(matches);
    empty.hidden = matches !== 0;
    if (reset) reset.hidden = !search.value && !type.value;

  };

  const restore = () => {
    const query = new URLSearchParams(window.location.search);
    search.value = query.get("q") ?? "";
    type.value = query.get("type") ?? "";
    type.dispatchEvent(new Event("change"));
    update();
  };

  const change = () => {
    const url = new URL(window.location.href);
    for (const [key, value] of [["q", search.value], ["type", type.value]]) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    window.history.replaceState(null, "", url);
    update();
  };

  form.hidden = false;
  restore();
  form.addEventListener("input", change);
  form.addEventListener("submit", (event) => { event.preventDefault(); change(); });
  form.addEventListener("reset", (event) => {
    event.preventDefault();
    search.value = type.value = "";
    type.dispatchEvent(new Event("change"));
    change();
    search.focus();
  });
  window.addEventListener("popstate", restore);
}
