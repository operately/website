export function initializeTemplatePreviewDialog(root: HTMLElement) {
  const dialog = root.querySelector<HTMLDialogElement>("dialog[data-template-dialog]");
  const content = dialog?.querySelector<HTMLElement>("[data-preview-content]");
  const close = dialog?.querySelector<HTMLElement>("[data-preview-close]");
  if (!dialog || !content || !close || !dialog.showModal) return;

  const previews = new Map(
    Array.from(root.querySelectorAll<HTMLTemplateElement>("template[data-template-preview]"))
      .map((template) => [template.dataset.templatePreview, template]),
  );
  const allCards = Array.from(root.querySelectorAll<HTMLAnchorElement>("a[data-template-open]"))
    .filter((card) => previews.has(card.dataset.templateOpen));
  allCards.forEach((card) => card.setAttribute("aria-haspopup", "dialog"));
  let opener: HTMLAnchorElement | null = null;
  let previousOverflow = "";
  let modalOpen = false;
  let returnUrl = `/library${window.location.search}`;

  const locationCard = () => allCards.find((card) =>
    card.pathname.replace(/\/$/, "") === window.location.pathname.replace(/\/$/, ""));

  const show = (card: HTMLAnchorElement) => {
    const template = previews.get(card.dataset.templateOpen);
    const slug = card.dataset.templateOpen;
    if (!template || !slug) return;
    if (content.dataset.previewSlug !== slug) {
      content.replaceChildren(template.content.cloneNode(true));
      content.dataset.previewSlug = slug;
    }
    dialog.scrollTop = 0;
    if (!modalOpen) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      // Upgrade a prerendered open dialog into the browser's modal top layer.
      dialog.removeAttribute("open");
      dialog.showModal();
      modalOpen = true;
      close.focus({ preventScroll: true });
    }
  };

  const hide = () => {
    if (!modalOpen) return;
    modalOpen = false;
    dialog.close();
    document.body.style.overflow = previousOverflow;
    content.replaceChildren();
    delete content.dataset.previewSlug;
    opener?.focus({ preventScroll: true });
  };

  const requestClose = () => {
    hide();
    if (window.history.state?.templatePreviewReturn === returnUrl) {
      window.history.back();
    } else {
      // A shared URL has no gallery entry to go back to.
      window.history.replaceState(null, "", returnUrl);
    }
  };

  const navigate = (card: HTMLAnchorElement, replace: boolean) => {
    const url = new URL(card.href);
    url.search = window.location.search;
    if (replace) {
      window.history.replaceState(window.history.state, "", url);
    } else {
      returnUrl = window.location.pathname + window.location.search + window.location.hash;
      window.history.pushState({ templatePreviewReturn: returnUrl }, "", url);
    }
    show(card);
  };

  root.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const card = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[data-template-open]") : null;
    if (!card || !allCards.includes(card)) return;
    event.preventDefault();
    opener = card;
    navigate(card, modalOpen);
  });

  close.addEventListener("click", (event) => { event.preventDefault(); requestClose(); });
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); requestClose(); });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      requestClose();
    }
  });
  dialog.addEventListener("close", () => { if (modalOpen) requestClose(); });

  const restore = () => {
    const card = locationCard();
    if (!card) { hide(); return; }
    returnUrl = window.history.state?.templatePreviewReturn ?? `/library${window.location.search}`;
    opener ??= card;
    show(card);
  };
  // Restore after other page state has handled browser navigation.
  let disposed = false;
  const onPopState = () => queueMicrotask(() => { if (!disposed) restore(); });
  window.addEventListener("popstate", onPopState);
  restore();
  return () => {
    disposed = true;
    window.removeEventListener("popstate", onPopState);
  };
}
