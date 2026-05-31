import { PageHeader } from "../components/PageHeader";
import { LegalSection } from "../components/LegalSection";

export default function Terms() {
  return (
    <div className="max-w-[760px]">
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="Last updated 31 May 2026 · plain-English draft"
      />

      <div className="space-y-7 text-sm leading-relaxed text-neutral-300">
        <p>
          By using Koe you agree to these terms. They're written to be readable,
          not to trap you. If something here seems unfair, tell us.
        </p>

        <LegalSection title="The service">
          <p>
            Koe lets you stream music from third-party catalogs and organize it
            into favorites and playlists. Music is provided by those sources
            under their own licenses — Koe doesn't own or sell the audio. The
            service is offered free and as-is, with no uptime guarantee.
          </p>
        </LegalSection>

        <LegalSection title="Your account">
          <ul className="list-disc pl-5 space-y-2 marker:text-neutral-600">
            <li>You're responsible for activity under your account.</li>
            <li>
              Pick a username that isn't impersonating someone else or a Koe
              system name.
            </li>
            <li>
              You can delete your account at any time from Settings. We may
              suspend accounts that abuse the service.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="Uploads">
          <p>
            You may upload audio you have the right to use. Uploaded files stay
            in your own browser storage — they are not redistributed by Koe.
            Don't upload anything illegal or that infringes someone's rights.
          </p>
        </LegalSection>

        <LegalSection title="Acceptable use">
          <p>
            Don't abuse the service: no scraping at scale, no attempts to break
            quotas or other users' data, no using Koe to distribute malware or
            harassment.
          </p>
        </LegalSection>

        <LegalSection title="Liability">
          <p>
            Koe is provided without warranties. To the extent allowed by law, we
            aren't liable for indirect or incidental damages arising from use of
            the service. Third-party content is the responsibility of its
            provider.
          </p>
        </LegalSection>

        <LegalSection title="Changes">
          <p>
            We may update these terms as the service evolves. Material changes
            will be reflected by the date at the top of this page. Continued use
            after a change means you accept the updated terms.
          </p>
        </LegalSection>

        <LegalSection title="Contact">
          <p>
            Questions? Email{" "}
            <a
              href="mailto:hello@koe.moe"
              className="accent-text hover:underline"
            >
              hello@koe.moe
            </a>
            .
          </p>
        </LegalSection>
      </div>
    </div>
  );
}
