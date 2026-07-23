"use client";

import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export function AssistantMessageContent({ content, loading }) {
  if (!content) {
    return loading ? "…" : " ";
  }

  return (
    <div className="ai-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a({ children, ...props }) {
            return (
              <a
                {...props}
                target="_blank"
                rel="noreferrer noopener"
                className="ai-markdown-link"
              >
                {children}
              </a>
            );
          },
          blockquote({ children, ...props }) {
            return (
              <blockquote {...props} className="ai-markdown-quote">
                {children}
              </blockquote>
            );
          },
          code({ className, children, ...props }) {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code {...props} className={className}>
                  {children}
                </code>
              );
            }

            return (
              <code {...props} className="ai-markdown-inline-code">
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <pre className="ai-markdown-pre">{children}</pre>;
          },
          table({ children, ...props }) {
            return (
              <div className="ai-markdown-table-wrap">
                <table {...props} className="ai-markdown-table">
                  {children}
                </table>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
