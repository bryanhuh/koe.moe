import { openDB } from "idb";

const DB_NAME = "koe-uploads";
const STORE = "blobs";

const db = openDB(DB_NAME, 1, {
  upgrade(database) {
    database.createObjectStore(STORE);
  },
});

export async function storeBlob(key: string, blob: Blob): Promise<void> {
  await (await db).put(STORE, blob, key);
}

export async function getBlob(key: string): Promise<Blob | undefined> {
  return (await db).get(STORE, key);
}

export async function deleteBlob(key: string): Promise<void> {
  await (await db).delete(STORE, key);
}
