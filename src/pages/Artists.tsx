import { PageHeader } from "../components/PageHeader";
import { ArtistGrid } from "../components/ArtistGrid";
import { artists } from "../data/mockData";

export default function Artists() {
  return (
    <div>
      <PageHeader
        eyebrow="Browse"
        title="Artists"
        subtitle={`${artists.length} artists`}
      />
      <ArtistGrid artists={artists} />
    </div>
  );
}
