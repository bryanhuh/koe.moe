import { useCallback, useEffect, useRef, useState } from "react";
import { Music, Play, Trash2, Upload } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { TrackCard } from "../components/TrackCard";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import {
  buildTrackFromRecord,
  deleteUpload,
  loadUploads,
  uploadFile,
} from "../lib/uploads";
import type { Track } from "../data/mockData";
import type { UploadRecord } from "../lib/uploads";

const AUDIO_EXTS = /\.(mp3|flac|ogg|wav|aac|m4a|opus)$/i;

export default function Library() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [records, setRecords] = useState<UploadRecord[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { registerTracks, playAlbum } = usePlayer();
  const { user, requireAuth } = useAuth();

  useEffect(() => {
    if (!user) {
      setTracks([]);
      setRecords([]);
      return;
    }

    let cancelled = false;
    const createdUrls: string[] = [];

    loadUploads().then(async (recs) => {
      if (cancelled) return;
      const built: Track[] = [];
      for (const rec of recs) {
        const track = await buildTrackFromRecord(rec);
        if (track.audioUrl) {
          createdUrls.push(track.audioUrl);
          objectUrlsRef.current.push(track.audioUrl);
        }
        built.push(track);
      }
      if (cancelled) {
        createdUrls.forEach(URL.revokeObjectURL);
        return;
      }
      setRecords(recs);
      setTracks(built);
      registerTracks(built);
    });

    return () => {
      cancelled = true;
    };
  }, [user, registerTracks]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(URL.revokeObjectURL);
    };
  }, []);

  const processFiles = useCallback(
    async (files: File[]) => {
      const audioFiles = files.filter(
        (f) => f.type.startsWith("audio/") || AUDIO_EXTS.test(f.name),
      );
      if (!audioFiles.length) return;

      setUploading(true);
      setUploadError(null);

      try {
        for (const file of audioFiles) {
          const rec = await uploadFile(file);
          const track = await buildTrackFromRecord(rec);
          if (track.audioUrl) objectUrlsRef.current.push(track.audioUrl);
          setRecords((prev) => [rec, ...prev]);
          setTracks((prev) => {
            const updated = [track, ...prev];
            registerTracks(updated);
            return updated;
          });
        }
      } catch (e) {
        setUploadError((e as Error).message ?? "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [registerTracks],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (!user) {
        requireAuth(() => {});
        return;
      }
      processFiles(Array.from(e.dataTransfer.files));
    },
    [user, requireAuth, processFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(Array.from(e.target.files));
      e.target.value = "";
    },
    [processFiles],
  );

  const handleZoneClick = useCallback(() => {
    if (!user) {
      requireAuth(() => {});
      return;
    }
    inputRef.current?.click();
  }, [user, requireAuth]);

  const handleDelete = useCallback(async (rec: UploadRecord) => {
    await deleteUpload(rec);
    setRecords((prev) => prev.filter((r) => r.id !== rec.id));
    setTracks((prev) => prev.filter((t) => t.id !== `local:${rec.idb_key}`));
  }, []);

  const trackIds = tracks.map((t) => t.id);

  return (
    <div>
      <PageHeader
        eyebrow="Collection"
        title="Library"
        subtitle={tracks.length > 0 ? `${tracks.length} upload${tracks.length !== 1 ? "s" : ""}` : undefined}
        actions={
          tracks.length > 0 ? (
            <button
              onClick={() => playAlbum(trackIds)}
              className="flex items-center gap-2 accent-bg text-black font-semibold text-sm px-4 py-2 rounded-full hover:brightness-110"
            >
              <Play size={14} fill="currentColor" />
              Play all
            </button>
          ) : null
        }
      />

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        className={`mb-8 border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer select-none transition-colors ${
          dragging
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[#222] hover:border-[#333] hover:bg-[#0d0d0d]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,.mp3,.flac,.ogg,.wav,.aac,.m4a,.opus"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
        <Upload
          size={28}
          className={dragging ? "accent-text" : "text-neutral-500"}
        />
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-300">
            {uploading ? "Uploading…" : "Drop audio files here"}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {user
              ? "MP3, FLAC, WAV, OGG, AAC, M4A — click to browse"
              : "Sign in to save local uploads"}
          </p>
        </div>
      </div>

      {uploadError && (
        <div className="mb-5 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {uploadError}
        </div>
      )}

      {tracks.length > 0 ? (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-2">
          {tracks.map((t, i) => {
            const rec = records.find((r) => `local:${r.idb_key}` === t.id);
            return (
              <div key={t.id} className="group/row flex items-center">
                <div className="flex-1 min-w-0">
                  <TrackCard track={t} variant="row" index={i} queueIds={trackIds} />
                </div>
                {rec && (
                  <button
                    onClick={() => handleDelete(rec)}
                    className="shrink-0 opacity-0 group-hover/row:opacity-100 text-neutral-600 hover:text-red-400 transition-colors px-3 py-2"
                    aria-label="Delete upload"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        !uploading && (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-600">
            <Music size={44} className="mb-4 opacity-25" />
            <p className="text-sm">No uploads yet</p>
          </div>
        )
      )}
    </div>
  );
}
