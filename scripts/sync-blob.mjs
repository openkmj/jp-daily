import { put, list, del } from "@vercel/blob";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env.local");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (!m) continue;
  let value = m[2].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  process.env[m[1]] = value;
}

console.log("listing existing blobs under lessons/ ...");
let cursor;
const toDelete = [];
do {
  const res = await list({ prefix: "lessons/", limit: 1000, cursor });
  for (const b of res.blobs) {
    toDelete.push(b.url);
    console.log("  found:", b.pathname);
  }
  cursor = res.hasMore ? res.cursor : undefined;
} while (cursor);

if (toDelete.length > 0) {
  console.log(`deleting ${toDelete.length} blob(s) ...`);
  await del(toDelete);
  console.log("deleted.");
} else {
  console.log("nothing to delete.");
}

const months = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12"];
for (const m of months) {
  const file = path.resolve(__dirname, "..", "content", "drafts", `${m}.json`);
  const data = readFileSync(file, "utf8");
  console.log(`uploading lessons/${m}.json ...`);
  const result = await put(`lessons/${m}.json`, data, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log("  ->", result.url);
}
console.log("done.");
