import * as path from "path";

export function isValidUrl(uri: string): boolean {
  let url;
  try {
    url = new URL(uri);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

export function isValidFileUrl(uri: string): boolean {
  let url;
  try {
    url = new URL(uri);
  } catch (_) {
    return false;
  }
  return url.protocol === "file:";
}

export function getFilePath(uri: string): string {
  if (isValidFileUrl(uri)) {
    const path = new URL(uri);
    return path.pathname;
  }
  return path.resolve(uri);
}
