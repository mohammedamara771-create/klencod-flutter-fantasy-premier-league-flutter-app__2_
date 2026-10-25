import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export const PROJECT_DIR = path.join(process.cwd(), "public", "klencode");

/** يسرد كل ملفات مشروع Flutter بشكل متكرر (مسارات نسبية) */
export async function listProjectFiles(dir = PROJECT_DIR): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listProjectFiles(full)));
    } else {
      files.push(path.relative(PROJECT_DIR, full).split(path.sep).join("/"));
    }
  }
  return files.sort();
}

/** يقرأ ملفاً ويستبدل عنوان الخادم داخله */
export async function readProjectFile(relativePath: string, baseUrl: string) {
  const safe = relativePath.replace(/\\/g, "/").replace(/\.\./g, "");
  const full = path.join(PROJECT_DIR, safe);
  if (!full.startsWith(PROJECT_DIR)) throw new Error("مسار غير مسموح");
  const content = await readFile(full, "utf8");
  return content.replaceAll("__BASE_URL__", baseUrl);
}

export function originFrom(request: Request) {
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
}
