import { useEffect, useRef, useState } from "react";

import { CopyIcon } from "./Icons";

const COPY_FEEDBACK_DURATION_MS = 3000;

export default function CurlExampleBlock({ command }) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!command) return;

    const copied = await copyToClipboard(command);
    if (!copied) return;

    setIsCopied(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setIsCopied(false);
    }, COPY_FEEDBACK_DURATION_MS);
  };

  return (
    <div className="curl-copy-block">
      <button type="button" className="curl-copy-button" aria-label="Copy curl command" onClick={handleCopy}>
        <CopyIcon className="curl-copy-icon" />
      </button>

      <span className={`curl-copy-feedback ${isCopied ? "is-visible" : ""}`} aria-live="polite">
        Copied
      </span>

      <pre>
        <code className="language-bash">{command}</code>
      </pre>
    </div>
  );
}

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_error) {
      // Fall back to execCommand below.
    }
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textArea);

  return copied;
}
