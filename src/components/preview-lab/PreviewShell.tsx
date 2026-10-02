import React, { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./shell.css";
import { dismissOpenDialog, focusableElements, focusedElement, previewRoot } from "./focus";

const EmbeddedDemo = lazy(() => import("./EmbeddedDemo").then(({ EmbeddedDemo }) => ({ default: EmbeddedDemo })));

const desktop = { width: 1440, height: 900 };

export function PreviewShell() {
  const [maximized, setMaximized] = useState(false);
  const [size, setSize] = useState(desktop);
  const shell = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const close = () => setMaximized(false);

  useLayoutEffect(() => {
    if (!viewport.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!maximized || !shell.current) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Make siblings inert at each ancestor without moving or remounting the demo.
    const siblings: { element: HTMLElement; inert: boolean }[] = [];
    let element: HTMLElement | null = shell.current;
    while (element?.parentElement) {
      for (const sibling of element.parentElement.children) {
        if (sibling !== element && sibling instanceof HTMLElement) {
          siblings.push({ element: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      element = element.parentElement;
      if (element === document.body) break;
    }
    toggle.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !shell.current) return;
      if (event.key === "Escape") {
        // Escape from the toolbar should also dismiss an open demo dialog first.
        if (event.target === toggle.current && dismissOpenDialog(previewRoot(shell.current))) return;
        close();
      }
      if (event.key === "Tab") {
        const elements = focusableElements(shell.current);
        const first = elements[0];
        const last = elements.at(-1);
        const focused = focusedElement();
        if (event.shiftKey && focused === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && focused === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      siblings.forEach(({ element, inert }) => {
        element.inert = inert;
      });
      window.removeEventListener("keydown", onKey);
      toggle.current?.focus({ preventScroll: true });
    };
  }, [maximized]);

  const scale = maximized ? 1 : Math.min(1, size.width / desktop.width);
  return (
    <div className="preview-placeholder" style={{ aspectRatio: `${desktop.width} / ${desktop.height + 64}` }}>
      <div
        ref={shell}
        className="preview-shell"
        data-maximized={maximized}
        role={maximized ? "dialog" : "region"}
        aria-modal={maximized || undefined}
        aria-label="Interactive KPI preview"
      >
        <div className="preview-toolbar">
          <span>
            Try KPIs <span className="preview-caption">· Sample data</span>
          </span>
          <button ref={toggle} type="button" onClick={() => setMaximized((value) => !value)} aria-expanded={maximized}>
            <span aria-hidden="true">{maximized ? "↙" : "↗"}</span>{" "}
            {maximized ? "Close expanded preview" : "Expand preview"}
          </button>
        </div>
        <div
          ref={viewport}
          className="preview-viewport"
          style={maximized ? undefined : { height: desktop.height * scale }}
        >
          <div
            className="preview-stage"
            style={{
              width: maximized ? size.width : desktop.width,
              height: maximized ? size.height : desktop.height,
              transform: `scale(${scale})`,
            }}
          >
            <Suspense fallback={<p>Loading the preview…</p>}>
              <EmbeddedDemo />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
