"use client";

import { createBundledHighlighter } from "@shikijs/core";
import { useEffect, useState } from "react";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { Pre } from "@/components/code-block/client";
import { FUMADOCS_TYPESCRIPT_ICON_HTML } from "@/components/code-block/fumadocs-code-block-icons";
import styles from "./styles.module.css";

type Props = {
  code: string;
};

const HIGHLIGHT_DEBOUNCE_MS = 80;

/** CSP-safe: JS RegExp engine only (no Shiki WASM / unsafe-eval). */
const createJsHighlighter = createBundledHighlighter({
  langs: {
    typescript: () => import("@shikijs/langs/typescript"),
  },
  themes: {
    "snazzy-light": () => import("@shikijs/themes/snazzy-light"),
    "slack-dark": () => import("@shikijs/themes/slack-dark"),
  },
  engine: () => createJavaScriptRegexEngine({ forgiving: true }),
});

let highlighterPromise: ReturnType<typeof createJsHighlighter> | null = null;

function getHighlighter() {
  highlighterPromise ??= createJsHighlighter({
    langs: ["typescript"],
    themes: ["snazzy-light", "slack-dark"],
  });
  return highlighterPromise;
}

export function CodePreview({ code }: Props) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    setHtml(null);
    let cancelled = false;
    const timeout = setTimeout(() => {
      void (async () => {
        const highlighter = await getHighlighter();
        const next = highlighter.codeToHtml(code, {
          lang: "typescript",
          themes: { light: "snazzy-light", dark: "slack-dark" },
          defaultColor: false,
        });
        if (!cancelled) setHtml(next);
      })();
    }, HIGHLIGHT_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [code]);

  return (
    <div className={styles.codeScroll}>
      <Pre
        title="sound.ts"
        icon={FUMADOCS_TYPESCRIPT_ICON_HTML}
        showCopyButton={false}
        highlightedHtml={html ?? undefined}
      >
        {html === null ? <code>{code}</code> : null}
      </Pre>
    </div>
  );
}
