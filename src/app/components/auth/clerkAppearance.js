export const clerkAppearance = {
  variables: {
    colorPrimary: "var(--color-app-accent)",
    colorBackground: "transparent",
    colorText: "var(--color-app-text)",
    colorTextSecondary: "var(--color-app-text-muted)",
    colorNeutral: "var(--color-app-text)",
    colorInputBackground: "var(--color-app-surface)",
    colorInputText: "var(--color-app-text)",
    colorInputBorder: "var(--color-app-border)",
    colorShimmer: "rgba(255, 255, 255, 0.04)",
    borderRadius: "18px",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full max-w-full text-[var(--color-app-text)]",
    cardBox:
      "w-full max-w-full bg-transparent text-[var(--color-app-text)] shadow-none border-0 p-0",
    card: "w-full bg-transparent shadow-none border-0 p-0",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    footer:
      "bg-transparent text-[var(--color-app-text-muted)] border-t border-[var(--color-app-border)] !bg-none",
    footerAction: "bg-transparent text-[var(--color-app-text-muted)]",
    footerActionText: "text-[var(--color-app-text-muted)]",
    footerActionLink:
      "text-[var(--color-app-accent)] hover:text-[var(--color-app-accent-hover)] font-medium",
    footerPages: "bg-transparent text-[var(--color-app-text-soft)]",
    footerPagesLink:
      "text-[var(--color-app-text-soft)] hover:text-[var(--color-app-text)]",
    socialButtonsBlockButton:
      "border border-[var(--color-app-border)] bg-[var(--color-app-chip)] text-[var(--color-app-text)] shadow-none hover:bg-[var(--color-app-surface)]",
    formButtonPrimary:
      "bg-[var(--color-app-accent)] text-[var(--color-app-accent-fg)] shadow-[0_18px_50px_rgba(15,23,42,0.12)] hover:brightness-110",
    formFieldInput:
      "border border-[var(--color-app-border)] bg-[var(--color-app-surface-soft)] text-[var(--color-app-text)] shadow-none focus:border-[var(--color-app-border-strong)]",
    formFieldLabel: "text-[var(--color-app-text-soft)]",
    identityPreviewText: "text-[var(--color-app-text-muted)]",
    dividerLine: "bg-[var(--color-app-border)]",
    dividerText: "text-[var(--color-app-text-soft)]",
    formResendCodeLink: "text-[var(--color-app-accent)]",
    formFieldHintText: "text-[var(--color-app-text-soft)]",
  },
};
