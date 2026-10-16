import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { PreviewViewport, desktopPreviewSize } from "./PreviewViewport";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test("scales the whole desktop canvas without remounting its content", () => {
  let resize: ResizeObserverCallback = () => {};
  const disconnect = vi.fn();
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: ResizeObserverCallback) { resize = callback; }
    observe() {}
    disconnect = disconnect;
  });
  const { container, unmount } = render(<PreviewViewport><input defaultValue="Keep me" /></PreviewViewport>);
  const stage = container.querySelector<HTMLElement>("[data-preview-stage]");
  const input = container.querySelector("input");
  act(() => resize([{ contentRect: { width: desktopPreviewSize.width / 2 } } as ResizeObserverEntry], {} as ResizeObserver));
  expect(stage?.style.width).toBe(`${desktopPreviewSize.width}px`);
  expect(stage?.style.height).toBe(`${desktopPreviewSize.height}px`);
  expect(stage?.style.transform).toBe("scale(0.5)");
  act(() => resize([{ contentRect: { width: desktopPreviewSize.width / 4 } } as ResizeObserverEntry], {} as ResizeObserver));
  expect(stage?.style.transform).toBe("scale(0.25)");
  expect(container.querySelector("input")).toBe(input);
  unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});

test("fills the available screen without scaling in full-screen mode", () => {
  const { container } = render(<PreviewViewport mode="fullscreen"><span>Preview</span></PreviewViewport>);
  const stage = container.querySelector<HTMLElement>("[data-preview-stage]");
  expect(stage?.style.width).toBe("100%");
  expect(stage?.style.height).toBe("100%");
  expect(stage?.style.transform).toBe("none");
});


test("recalculates scale when the canvas dimensions change without a container resize", () => {
  const original = { ...desktopPreviewSize };
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 640 } as DOMRect);
  try {
    const { container, rerender } = render(<PreviewViewport><span>Preview</span></PreviewViewport>);
    const stage = container.querySelector<HTMLElement>("[data-preview-stage]");
    expect(stage?.style.transform).toBe(`scale(${640 / original.width})`);
    desktopPreviewSize.width = original.width / 2;
    desktopPreviewSize.height = original.height / 2;
    rerender(<PreviewViewport><span>Preview</span></PreviewViewport>);
    expect(stage?.style.width).toBe(`${desktopPreviewSize.width}px`);
    expect(stage?.style.transform).toBe(`scale(${Math.min(1, 640 / desktopPreviewSize.width)})`);
  } finally {
    Object.assign(desktopPreviewSize, original);
    vi.restoreAllMocks();
  }
});
