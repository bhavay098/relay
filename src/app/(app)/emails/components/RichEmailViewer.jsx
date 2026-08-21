"use client";

import { useState, useRef, useEffect, useMemo } from "react";

function getInitialTheme() {
  if (typeof document !== "undefined") {
    const docTheme = document.documentElement.dataset.theme;
    if (docTheme === "light") return "light";
    if (docTheme === "dark") return "dark";
    const stored = window.localStorage.getItem("relay-theme");
    if (stored === "light" || stored === "dark") return stored;
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      return "light";
    }
  }
  return "dark";
}

export function RichEmailViewer({ html, text, snippet }) {
  const [iframeHeight, setIframeHeight] = useState(400);
  const iframeRef = useRef(null);
  const [theme, setTheme] = useState(getInitialTheme);

  const hasHtml = Boolean(html && html.trim().length > 0);
  const isDark = theme === "dark";

  // Build sanitized, responsive HTML document for isolated iframe rendering
  const framedHtml = useMemo(() => {
    if (!html) return "";

    const bg = isDark ? "#101521" : "#ffffff";
    const fg = isDark ? "#f7f8fb" : "#0f172a";
    const linkColor = isDark ? "#60a5fa" : "#2563eb";
    const quoteBorder = isDark ? "rgba(140, 155, 180, 0.28)" : "#cbd5e1";
    const quoteColor = isDark ? "rgba(247, 248, 251, 0.7)" : "#64748b";
    const codeBg = isDark ? "#1a2232" : "#f1f5f9";
    const codeFg = isDark ? "#f7f8fb" : "#0f172a";

    return `
      <!DOCTYPE html>
      <html data-theme="${isDark ? "dark" : "light"}" style="color-scheme: ${isDark ? "dark" : "light"}; background-color: ${bg};">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <base target="_blank">
          <style>
            *, *:before, *:after { box-sizing: border-box; }
            :root {
              color-scheme: ${isDark ? "dark" : "light"};
            }
            html {
              background-color: ${bg} !important;
              color: ${fg} !important;
            }
            body {
              margin: 0;
              padding: 16px;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              font-size: 14.5px;
              line-height: 1.6;
              color: ${fg} !important;
              background-color: ${bg} !important;
              background: ${bg} !important;
              word-break: break-word;
              overflow-x: hidden;
            }
            img {
              max-width: 100% !important;
              height: auto !important;
            }
            table {
              max-width: 100% !important;
            }
            ${
              isDark
                ? `
            /* Dark mode comprehensive reset for nested email wrappers */
            body, table, tbody, thead, tfoot, tr, td, th, div, p, span, font, center, section, article, header, footer, main {
              background-color: transparent !important;
              color: inherit !important;
            }
            a, a span, a font {
              color: ${linkColor} !important;
              text-decoration: underline;
            }
            blockquote {
              border-left: 3px solid ${quoteBorder} !important;
              margin: 0.8em 0;
              padding-left: 12px;
              color: ${quoteColor} !important;
            }
            pre, code {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              background: ${codeBg} !important;
              color: ${codeFg} !important;
              padding: 2px 4px;
              border-radius: 4px;
              font-size: 13px;
            }
            hr {
              border: 0;
              border-top: 1px solid rgba(140, 155, 180, 0.2);
            }
            `
                : `
            a {
              color: ${linkColor} !important;
              text-decoration: underline;
            }
            blockquote {
              border-left: 3px solid ${quoteBorder};
              margin: 0.8em 0;
              padding-left: 12px;
              color: ${quoteColor};
            }
            pre, code {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              background: ${codeBg};
              color: ${codeFg};
              padding: 2px 4px;
              border-radius: 4px;
              font-size: 13px;
            }
            `
            }
          </style>
        </head>
        <body style="background-color: ${bg}; color: ${fg};">
          ${html}
          <script>
            function adaptColors() {
              if (${isDark}) {
                try {
                  var all = document.querySelectorAll('*');
                  for (var i = 0; i < all.length; i++) {
                    var el = all[i];
                    if (el.tagName === 'IMG' || el.tagName === 'SVG' || el.tagName === 'CANVAS' || el.tagName === 'VIDEO') continue;
                    if (el.hasAttribute('bgcolor')) {
                      el.removeAttribute('bgcolor');
                    }
                    if (el.hasAttribute('color')) {
                      el.removeAttribute('color');
                    }
                    if (el.style) {
                      if (el.style.backgroundColor && el.style.backgroundColor !== 'transparent') {
                        el.style.setProperty('background-color', 'transparent', 'important');
                      }
                      if (el.style.background && el.style.background !== 'none') {
                        el.style.setProperty('background', 'transparent', 'important');
                      }
                      if (el.style.color) {
                        el.style.setProperty('color', '#f7f8fb', 'important');
                      }
                    }
                  }
                } catch(e) {}
              }

              var height = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
                240
              );
              window.parent.postMessage({ type: "relay-email-height", height: height }, "*");
            }

            window.addEventListener("load", adaptColors);
            window.addEventListener("resize", adaptColors);
            document.addEventListener("DOMContentLoaded", adaptColors);
            setTimeout(adaptColors, 30);
            setTimeout(adaptColors, 150);
            setTimeout(adaptColors, 500);
            setTimeout(adaptColors, 1200);
          </script>
        </body>
      </html>
    `;
  }, [html, isDark]);

  // Keep theme synced with document data-theme changes
  useEffect(() => {
    const handleUpdate = () => {
      const docTheme = document.documentElement.dataset.theme;
      if (docTheme === "light" || docTheme === "dark") {
        setTheme(docTheme);
        return;
      }
      const stored = window.localStorage.getItem("relay-theme");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        return;
      }
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches
      ) {
        setTheme("light");
      } else {
        setTheme("dark");
      }
    };

    const observer = new MutationObserver(handleUpdate);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const handleStorage = (e) => {
      if (e.key === "relay-theme") handleUpdate();
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Listen for iframe height messages
  useEffect(() => {
    const handleMessage = (event) => {
      if (
        event.data &&
        event.data.type === "relay-email-height" &&
        typeof event.data.height === "number"
      ) {
        setIframeHeight(Math.max(200, Math.min(event.data.height + 24, 3000)));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (hasHtml) {
    return (
      <div className="overflow-hidden rounded-[18px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] shadow-sm transition-all">
        <iframe
          ref={iframeRef}
          srcDoc={framedHtml}
          title="Email content"
          allowtransparency="true"
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
          className="w-full border-0 transition-[height] duration-200"
          style={{
            height: `${iframeHeight}px`,
            minHeight: "240px",
            backgroundColor: "transparent",
          }}
        />
      </div>
    );
  }

  return (
    <div className="rounded-[18px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] p-4 sm:p-5">
      <p className="whitespace-pre-wrap text-[14.5px] leading-7 text-[var(--color-app-text)] font-[family:var(--font-inter)]">
        {text || snippet || "No text body available for this email."}
      </p>
    </div>
  );
}

