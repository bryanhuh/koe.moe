import { PageHeader } from "../components/PageHeader";
import { AlbumGrid } from "../components/AlbumGrid";
import { albums } from "../data/mockData";

export default function Albums() {
  return (
    <div>
      <PageHeader
        eyebrow="Browse"
        title="Albums"
        subtitle={`${albums.length} albums in your library`}
      />
      <AlbumGrid albums={albums} columns={4} />
    </div>
  );
}
