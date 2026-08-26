export type StoredObject = { bucket: string; key: string; mimeType: string; bytes: number };
export interface StorageProvider {
  put(key: string, data: ArrayBuffer, mimeType: string): Promise<StoredObject>;
  createSignedReadUrl(key: string, expiresInSeconds: number): Promise<string>;
  remove(key: string): Promise<void>;
}
