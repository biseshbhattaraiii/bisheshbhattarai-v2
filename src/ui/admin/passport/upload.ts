/**
 * Browser-side photo handling: resize to at most 2000px on the long edge
 * and re-encode as JPEG before upload. Phone photos drop from ~5 MB to
 * ~500 KB, which keeps uploads under the serverless body limit and the
 * pages fast.
 */

const LONG_EDGE = 2000;

export async function resizePhoto(file: File): Promise<Blob> {
  if (file.type === 'image/gif') return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, LONG_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), 'image/jpeg', 0.86)
    );
  } catch {
    // The browser could not decode it (HEIC on some browsers): send as is
    // and let the server explain what it accepts.
    return file;
  }
}

/** Uploads one photo and resolves its public URL, or throws a readable message. */
export async function uploadPhoto(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', await resizePhoto(file), file.name);
  const res = await fetch('/api/admin/passport/media', { method: 'POST', body });
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (res.status === 401) throw new Error('Your session expired. Sign in again in another tab, then retry.');
  if (!res.ok || !json.url) throw new Error(json.error ?? `${file.name} did not upload.`);
  return json.url;
}

/** Best-effort removal of a photo uploaded but never saved. */
export function discardPhoto(url: string): void {
  void fetch(`/api/admin/passport/media?url=${encodeURIComponent(url)}`, { method: 'DELETE' }).catch(
    () => undefined
  );
}
