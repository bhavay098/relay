import { HomeNavbar } from "../components/home/HomeNavbar.jsx";
import { HomeFooter } from "../components/home/HomeFooter.jsx";

export const metadata = {
  title: "Privacy Policy — Relay",
  description:
    "How Relay collects, uses, and protects your data, including Gmail and Google Calendar information accessed through Google APIs.",
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

export default function PrivacyPolicyPage() {
  return (
    <main className="home-page home-grid-bg min-h-screen bg-[var(--color-app-bg)] text-[var(--color-app-text)]">
      <HomeNavbar navLinks={navLinks} />

      <section className="mx-auto max-w-[820px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-app-text-soft)]">
          Legal
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-[var(--color-app-text-muted)]">
          Last updated: {lastUpdated}
        </p>

        <div className="mt-10 space-y-10 text-[15px] leading-7 text-[var(--color-app-text-muted)]">
          <p>
            Relay (&ldquo;Relay&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;our&rdquo;) is a productivity workspace that connects to your
            Gmail and Google Calendar accounts to help you read, draft, and
            organize your work through an AI-assisted interface. This Privacy
            Policy explains what information we collect, how we use it, and the
            choices you have.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              1. Information We Collect
            </h2>
            <div className="mt-3 space-y-3">
              <p>
                <span className="font-medium text-[var(--color-app-text)]">
                  Account information.
                </span>{" "}
                When you sign up, we collect your name, email address, and
                profile image via our authentication provider (Clerk).
              </p>
              <p>
                <span className="font-medium text-[var(--color-app-text)]">
                  Google account data.
                </span>{" "}
                When you connect your Google account, Relay requests access to
                Gmail and Google Calendar through Google&rsquo;s OAuth system.
                This may include email messages, message metadata (sender,
                recipient, subject, timestamps), calendar events, and event
                details, so that Relay can display, summarize, and help you act
                on that information.
              </p>
              <p>
                <span className="font-medium text-[var(--color-app-text)]">
                  Usage data.
                </span>{" "}
                We may collect information about how you interact with Relay,
                such as pages visited and actions taken, to maintain and improve
                the product.
              </p>
              <p>
                <span className="font-medium text-[var(--color-app-text)]">
                  AI chat content.
                </span>{" "}
                Messages you send to Relay&rsquo;s AI assistant, and any Gmail
                or Calendar data the assistant retrieves to answer you, are
                processed in order to generate a response.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              2. How We Use Your Information
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                To operate core features: displaying your emails and calendar,
                and enabling the AI assistant to read and act on them at your
                request.
              </li>
              <li>To authenticate you and keep your account secure.</li>
              <li>
                To maintain, troubleshoot, and improve Relay&rsquo;s
                functionality and reliability.
              </li>
              <li>
                To communicate with you about your account or material changes
                to this policy.
              </li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information, and we do not use your
              Gmail or Calendar data for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              3. Google User Data &amp; Limited Use
            </h2>
            <p className="mt-3">
              Relay&rsquo;s use and transfer of information received from Google
              APIs adheres to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[var(--color-app-border-strong)] underline-offset-2 hover:text-[var(--color-app-text)]"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements. Gmail and Calendar data
              is used only to provide and improve the features you see within
              Relay, and is not used to serve ads, sold, or transferred to third
              parties for purposes unrelated to providing the app&rsquo;s core
              functionality.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              4. Data Storage &amp; Security
            </h2>
            <p className="mt-3">
              Account and connection metadata is stored in our database. Gmail
              and Calendar content is retrieved via Google&rsquo;s APIs at the
              time it&rsquo;s needed to render your inbox, calendar, or AI
              responses. Access tokens are stored securely and used only to make
              authorized requests to Google APIs on your behalf. We use
              industry-standard measures, including encrypted connections
              (HTTPS/TLS), to protect data in transit.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              5. Data Sharing
            </h2>
            <p className="mt-3">
              We do not sell your personal data. We share information only with:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Service providers that help operate Relay (e.g., authentication,
                hosting, and database providers), under obligations to protect
                your data.
              </li>
              <li>
                Google, solely to authenticate your account and access
                Gmail/Calendar data you&rsquo;ve authorized.
              </li>
              <li>Authorities, where required by law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              6. Your Choices
            </h2>
            <p className="mt-3">
              You can disconnect your Google account from Relay at any time,
              which revokes Relay&rsquo;s access to your Gmail and Calendar
              data. You can also revoke access directly from your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[var(--color-app-border-strong)] underline-offset-2 hover:text-[var(--color-app-text)]"
              >
                Google Account permissions page
              </a>
              . You may request deletion of your Relay account and associated
              data by contacting us using the details below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              7. Data Retention
            </h2>
            <p className="mt-3">
              We retain account information for as long as your account is
              active. If you disconnect your Google account or delete your Relay
              account, we delete or revoke access to the associated Gmail and
              Calendar data within a reasonable period, except where retention
              is required for legal or security purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              8. Children&rsquo;s Privacy
            </h2>
            <p className="mt-3">
              Relay is not directed to individuals under the age of 13, and we
              do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              9. Changes to This Policy
            </h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. If we make
              material changes, we will update the &ldquo;Last updated&rdquo;
              date above.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-app-text)]">
              10. Contact Us
            </h2>
            <p className="mt-3">
              If you have questions about this Privacy Policy or how your data
              is handled, please contact us at{" "}
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
