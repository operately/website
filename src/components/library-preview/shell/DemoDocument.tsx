import React, { Suspense, useState } from "react";
import { EmbeddingProvider } from "@operately/turboui";
import css from "virtual:preview-css/shadow";

export function DemoDocument({ children }: { children: React.ReactNode }) {
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  const [scroll, setScroll] = useState<HTMLDivElement | null>(null);
  return (
    <>
      <style>{css}</style>
      <div
        className="demo-root light"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transform: "translateZ(0)",
        }}
      >
        <div
          ref={setScroll}
          style={{
            position: "absolute",
            inset: 0,
            overflow: "auto",
            overscrollBehavior: "contain",
          }}
        >
          {portal && scroll && (
            <EmbeddingProvider portalContainer={portal} scrollContainer={scroll} manageDocumentTitle={false}>
              <Suspense fallback={<p role="status">Loading the example…</p>}>{children}</Suspense>
            </EmbeddingProvider>
          )}
        </div>
        <div ref={setPortal} data-preview-portals style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        {/* Keep utility classes such as pointer-events-none effective on overlay children. */}
        <style>{":where([data-preview-portals] > *) { pointer-events: auto; }"}</style>
      </div>
    </>
  );
}
