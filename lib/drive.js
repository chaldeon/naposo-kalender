export function driveToThumbnail(url, size = 'w500') {
  if (!url) return url;
  const match = url.match(/[-\w]{25,}/);
  return match ? `https://drive.google.com/thumbnail?id=${match[0]}&sz=${size}` : url;
}
