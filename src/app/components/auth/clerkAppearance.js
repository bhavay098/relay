export const clerkAppearance = {
  variables: {
    colorPrimary: "var(--color-app-accent)",
    colorBackground: "transparent",
    colorText: "var(--color-app-text)",
    colorInputBackground: "var(--color-app-surface)",
    colorInputText: "var(--color-app-text)",
    colorShimmer: "rgba(255, 255, 255, 0.04)",
    borderRadius: "18px",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
  },
  elements: {
    rootBox: "text-[var(--color-app-text)]",
    cardBox:
      "bg-[var(--color-app-panel-strong)] text-[var(--color-app-text)] shadow-none border border-[var(--color-app-border-strong)]",
    card: [
      "w-full bg-transparent shadow-none",
      "border-0 p-0",
    ].join(" "),
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    footer: "bg-transparent text-[var(--color-app-text-muted)]",
    footerAction: "text-[var(--color-app-text-muted)]",
    socialButtonsBlockButton:
      "border border-[var(--color-app-border)] bg-[var(--color-app-chip)] text-[var(--color-app-text)] shadow-none hover:bg-[var(--color-app-surface)]",
    formButtonPrimary:
      "bg-[var(--color-app-accent)] text-white shadow-[0_18px_50px_rgba(217,119,6,0.2)] hover:brightness-110",
    formFieldInput:
      "border border-[var(--color-app-border)] bg-[var(--color-app-surface-soft)] text-[var(--color-app-text)] shadow-none focus:border-[var(--color-app-border-strong)]",
    formFieldLabel: "text-[var(--color-app-text-soft)]",
    footerActionLink: "text-[var(--color-app-accent)] hover:text-[var(--color-app-accent-hover)]",
    identityPreviewText: "text-[var(--color-app-text-muted)]",
    dividerLine: "bg-[var(--color-app-border)]",
    dividerText: "text-[var(--color-app-text-soft)]",
    formResendCodeLink: "text-[var(--color-app-accent)]",
    formFieldHintText: "text-[var(--color-app-text-soft)]",
  },
};
