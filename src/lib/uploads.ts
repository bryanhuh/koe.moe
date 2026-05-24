import { parseBlob } from "music-metadata-browser";
import { storeBlob, getBlob, deleteBlob } from "./idb";
import { supabase } from "./supabase";
import type { Track } from "../data/mockData";

export type UploadRecord = {
  id: string;
  user_id: string;
  filename: string;
  title: string | null;
  artist: string | null;
  album: string | null;
  duration_seconds: number | null;
  file_size_bytes: number;
  mime_type: string;
  idb_key: string;
  uploaded_at: string;
};

export async function uploadFile(file: File): Promise<UploadRecord> {
  const meta = await parseBlob(file).catch(() => null);
  const tags = meta?.common;
  const idbKey = crypto.randomUUID();

  await storeBlob(idbKey, file);

  const { data, error } = await supabase
    .from("uploads_metadata")
    .insert({
      filename: file.name,
      title: tags?.title ?? null,
      artist: tags?.artist ?? null,
      album: tags?.album ?? null,
      duration_seconds: meta?.format.duration
        ? Math.round(meta.format.duration)
        : null,
      file_size_bytes: file.size,
      mime_type: file.type || "audio/mpeg",
      idb_key: idbKey,
    })
    .select()
    .single();

  if (error) {
    await deleteBlob(idbKey).catch(() => {});
    throw error;
  }

  return data as UploadRecord;
}

export async function loadUploads(): Promise<UploadRecord[]> {
  const { data } = await supabase
    .from("uploads_metadata")
    .select("*")
    .order("uploaded_at", { ascending: false });
  return (data ?? []) as UploadRecord[];
}

export async function deleteUpload(record: UploadRecord): Promise<void> {
  await supabase.from("uploads_metadata").delete().eq("id", record.id);
  await deleteBlob(record.idb_key).catch(() => {});
}

export function recordToTrack(record: UploadRecord, audioUrl: string): Track {
  return {
    id: `local:${record.idb_key}`,
    title: record.title ?? record.filename,
    artist: record.artist ?? "Unknown Artist",
    artistId: "",
    album: record.album ?? "",
    albumId: "",
    duration: record.duration_seconds ?? 0,
    coverUrl: "",
    audioUrl,
    source: "local",
  };
}

export async function buildTrackFromRecord(record: UploadRecord): Promise<Track> {
  const blob = await getBlob(record.idb_key);
  const audioUrl = blob ? URL.createObjectURL(blob) : "";
  return recordToTrack(record, audioUrl);
}
