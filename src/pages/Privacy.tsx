import { PageHeader } from "../components/PageHeader";
import { LegalSection } from "../components/LegalSection";

export default function Privacy() {
  return (
    <div className="max-w-[760px]">
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="Last updated 31 May 2026 · plain-English draft"
      />

      <div className="space-y-7 text-sm leading-relaxed text-neutral-300">
        <p>
          Koe is a music player that lets you browse free streaming catalogs,
          favorite tracks, and build playlists. This policy explains what we
          store and why. We try to keep it short and honest.
        </p>

        <LegalSection title="What we collect">
          <ul className="list-disc pl-5 space-y-2 marker:text-neutral-600">
            <li>
              <span className="text-white">Account email.</span> Used only to
              sign you in (magic link) and send account-related email. We never
              sell it.
            </li>
            <li>
              <span className="text-white">A username.</span> Chosen by you when
              you sign up.
            </li>
            <li>
              <span className="text-white">Your library data.</span> Favorites,
              playlists, and listening history you create while signed in.
            </li>
            <li>
              <span className="text-white">Upload metadata.</span> If you upload
              local audio, the file's tags (title, artist, album, duration) are
              stored. The audio file itself never leaves your device — it lives
              in your browser's local storage.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="What we don't collect">
          <p>
            No advertising trackers, no third-party analytics profiles, no
            location data. Before you sign in, your favorites and history are
            kept only in your own browser.
          </p>
        </LegalSection>

        <LegalSection title="Where it's stored">
          <p>
            Account and library data live in our database (Supabase). Streaming
            audio plays directly from the source provider (iTunes, AnimeThemes)
            — we don't proxy or record what you listen to beyond your own
            history.
          </p>
        </LegalSection>

        <LegalSection title="Your controls">
          <p>
            From{" "}
            <span className="font-mono text-neutral-200">Settings</span> you can
            export all of your data as JSON at any time, or delete your account
            outright. Deleting your account permanently removes your profile,
            playlists, favorites, history, and upload metadata.
          </p>
        </LegalSection>

        <LegalSection title="Contact">
          <p>
            Questions about your data? Email{" "}
            <a
              href="mailto:privacy@koe.moe"
              className="accent-text hover:underline"
            >
              privacy@koe.moe
            </a>
            .
          </p>
        </LegalSection>
      </div>
    </div>
  );
}
