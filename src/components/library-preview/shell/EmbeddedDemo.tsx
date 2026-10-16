import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DemoDocument } from "./DemoDocument";

export function EmbeddedDemo({ cacheKey, children }: { cacheKey: string; children: React.ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const [shadow, setShadow] = useState<ShadowRoot | null>(null);
  useLayoutEffect(() => {
    if (host.current) setShadow(host.current.shadowRoot ?? host.current.attachShadow({ mode: "open" }));
  }, []);

  const cache = useMemo(() => (shadow ? createCache({ key: cacheKey, container: shadow }) : null), [cacheKey, shadow]);
  return (
    <div ref={host} data-shadow-preview style={{ width: "100%", height: "100%" }}>
      {shadow &&
        cache &&
        createPortal(
          <CacheProvider value={cache}>
            <DemoDocument>{children}</DemoDocument>
          </CacheProvider>,
          shadow,
        )}
    </div>
  );
}
