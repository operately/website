/** Include controls inside open shadow roots in the expanded preview's tab order. */
export function focusableElements(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>("*")).flatMap((element) => {
    if (element.shadowRoot) return focusableElements(element.shadowRoot);
    return element.tabIndex >= 0 && !element.matches(":disabled, [inert]") && element.getClientRects().length > 0
      ? [element]
      : [];
  });
}

export function focusedElement(root: Document | ShadowRoot = document): Element | null {
  const element = root.activeElement;
  if (element?.shadowRoot) return focusedElement(element.shadowRoot);
  return element;
}

export function previewRoot(shell: HTMLElement): ParentNode {
  return shell.querySelector("[data-shadow-preview]")?.shadowRoot ?? shell;
}

export function dismissOpenDialog(root: ParentNode): boolean {
  const dialogs = root.querySelectorAll<HTMLElement>('[data-preview-portals] [role="dialog"]');
  const dialog = Array.from(dialogs)
    .filter((element) => element.getClientRects().length > 0)
    .at(-1);
  if (!dialog) return false;
  dialog.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true, cancelable: true }),
  );
  return true;
}
