import React, { useLayoutEffect, useRef, useState } from "react";

// Match the desktop canvas used by the interactive article examples.
export const desktopPreviewSize = { width: 1200, height: 750 };
const desktop = desktopPreviewSize;
export type PreviewMode = "embedded" | "fullscreen";

export function PreviewViewport({ mode = "embedded", children }: { mode?: PreviewMode; children: React.ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(desktop.width);

  useLayoutEffect(() => {
    if (mode === "fullscreen" || !viewport.current) return;
    const update = (width: number) => { if (width > 0) setViewportWidth(width); };
    update(viewport.current.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => { if (entry) update(entry.contentRect.width); });
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [mode]);

  const fullscreen = mode === "fullscreen";
  const scale = Math.min(1, viewportWidth / desktop.width);
  return <div ref={viewport} style={{
    position: "relative", overflow: "hidden", width: "100%",
    height: fullscreen ? "100%" : undefined,
    maxWidth: fullscreen ? undefined : desktop.width,
    aspectRatio: fullscreen ? undefined : `${desktop.width} / ${desktop.height}`,
  }}>
    <div data-preview-stage style={{
      position: "absolute", inset: 0,
      width: fullscreen ? "100%" : desktop.width,
      height: fullscreen ? "100%" : desktop.height,
      transform: fullscreen ? "none" : `scale(${scale})`,
      transformOrigin: "top left", container: "demo-viewport / size",
    }}>{children}</div>
  </div>;
}
