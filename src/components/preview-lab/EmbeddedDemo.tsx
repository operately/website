import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DemoDocument } from "./DemoDocument";

export function EmbeddedDemo() {
  const host = useRef<HTMLDivElement>(null);
  const [shadow, setShadow] = useState<ShadowRoot | null>(null);
  useLayoutEffect(() => {
    if (host.current) setShadow(host.current.shadowRoot ?? host.current.attachShadow({ mode: "open" }));
  }, []);

  const cache = useMemo(() => (shadow ? createCache({ key: "kpi-preview", container: shadow }) : null), [shadow]);
  return (
    <div ref={host} data-shadow-preview style={{ width: "100%", height: "100%" }}>
      {shadow &&
        cache &&
        createPortal(
          <CacheProvider value={cache}>
            <DemoDocument />
          </CacheProvider>,
          shadow,
        )}
    </div>
  );
}
