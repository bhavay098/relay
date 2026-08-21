import Link from "next/link";
import { HomeNavbar } from "../components/home/HomeNavbar.jsx";
import { HomeFooter } from "../components/home/HomeFooter.jsx";

export const metadata = {
  title: "Terms of Service — Relay",
  description:
    "The terms that govern your use of Relay, the AI-powered Gmail and Google Calendar workspace.",
};

const navLinks = [
  { label: "Product", href: "/#product" },
  { label: "Workflow", href: "/#workflow" },
  { label: "Infrastructure", href: "/#infrastructure" },
];

const footerLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Dashboard", href: "/dashboard" },
];

const lastUpdated = "July 27, 2026";

export default function TermsOfServicePage() {
  return (
    <main className="home-page home-grid-bg min-h-screen bg-[var(--color-app-bg)] text-[var(--color-app-text)]">
      <HomeNavbar navLinks={navLinks} />

      <section className="mx-auto max-w-[820px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-app-text-soft)]">
          Legal
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-[var(--color-app-text-muted)]">
          Last updated: {lastUpdated}
        </p>

        <div className="mt-10 space-y-10 text-[15px] leading-7 text-[var(--color-app-text-muted)]">
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
            and use of Relay (&ldquo;Relay&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;, or &ldquo;our&rdquo;), a productivity workspace
            that connects Gmail and Google Calendar with an AI chat agent. By
            creating an account or using Relay, you agree to these Terms.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              1. Using Relay
            </h2>
            <p className="mt-3">
              You must be at least 13 years old to use Relay. You&rsquo;re
              responsible for maintaining the security of your account and for
              all activity that occurs under it. You agree to use Relay only for
              lawful purposes and in accordance with these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              2. Google Account Connection
            </h2>
            <p className="mt-3">
              Relay integrates with Gmail and Google Calendar through
              Google&rsquo;s OAuth authorization. By connecting your Google
              account, you authorize Relay to access the Gmail and Calendar data
              needed to provide its features, subject to our{" "}
              <Link
                href="/privacy"
                className="underline decoration-[var(--color-app-border-strong)] underline-offset-2 hover:text-[var(--color-app-text)]"
              >
                Privacy Policy
              </Link>
              . You can revoke this access at any time from within Relay or from
              your Google Account settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              3. The AI Assistant
            </h2>
            <p className="mt-3">
              Relay includes an AI-powered chat agent that can read, draft, and
              summarize content, and take actions such as sending emails or
              creating calendar events, when you instruct it to. You are
              responsible for reviewing AI-generated content and actions before
              relying on them. Relay is not liable for inaccuracies in
              AI-generated output or for actions the assistant takes based on
              your instructions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              4. Acceptable Use
            </h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Use Relay to send spam, unlawful, or abusive content.</li>
              <li>
                Attempt to gain unauthorized access to Relay&rsquo;s systems or
                another user&rsquo;s account or data.
              </li>
              <li>
                Interfere with or disrupt the integrity or performance of Relay.
              </li>
              <li>
                Use Relay to violate Google&rsquo;s API Terms of Service or any
                applicable law.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              5. Your Content
            </h2>
            <p className="mt-3">
              You retain ownership of your emails, calendar data, and any
              content you provide to Relay. You grant us a limited license to
              process that content solely to provide and improve Relay&rsquo;s
              features, as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              6. Service Availability
            </h2>
            <p className="mt-3">
              Relay is provided on an &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; basis. We do not guarantee uninterrupted or
              error-free operation, and features may change or be discontinued
              at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              7. Termination
            </h2>
            <p className="mt-3">
              You may stop using Relay and delete your account at any time. We
              may suspend or terminate access to Relay if you violate these
              Terms or if we discontinue the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              8. Disclaimer &amp; Limitation of Liability
            </h2>
            <p className="mt-3">
              To the maximum extent permitted by law, Relay and its developer
              disclaim all warranties, express or implied, and shall not be
              liable for any indirect, incidental, or consequential damages
              arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              9. Changes to These Terms
            </h2>
            <p className="mt-3">
              We may update these Terms from time to time. Continued use of
              Relay after changes take effect constitutes acceptance of the
              updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              10. Contact Us
            </h2>
            <p className="mt-3">
              Questions about these Terms can be sent to{" "}
              <a
                href="mailto:bhavaynagpal000@gmail.com"
                className="underline decoration-[var(--color-app-border-strong)] underline-offset-2 hover:text-[var(--color-app-text)]"
              >
                bhavaynagpal000@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </section>

      <HomeFooter footerLinks={footerLinks} />
    </main>
  );
}
