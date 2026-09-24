/** Strict raster-only data URLs; accepts legacy JPEG previews too. */
export function parseImage(value: unknown, maxBytes = 20 * 1024 * 1024) {
  if (typeof value !== 'string' || value.length > Math.ceil(maxBytes / 3) * 4 + 80) return null;
  const match = value.match(/^data:(image\/(?:png|jpeg|webp))(?:;charset=utf-8)?;base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match) return null;
  try {
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const mime = match[1];
    const valid = mime === 'image/png' ? [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v)
      : mime === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      : String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP';
    return valid && bytes.length <= maxBytes ? { bytes, mime, data: match[2], extension: mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1] } : null;
  } catch { return null; }
}
