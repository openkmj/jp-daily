import { put } from "@vercel/blob";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load .env.local manually so this script runs without next.
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

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/upload-sample.mjs <month-archive.json>");
  process.exit(1);
}

const data = readFileSync(file, "utf8");
const parsed = JSON.parse(data);
const month = parsed.month;
if (!/^\d{4}-\d{2}$/.test(month)) {
  console.error("invalid month in file:", month);
  process.exit(1);
}

const result = await put(`lessons/${month}.json`, data, {
  access: "public",
  contentType: "application/json",
  addRandomSuffix: false,
  allowOverwrite: true,
});

console.log("uploaded:", result.url);
