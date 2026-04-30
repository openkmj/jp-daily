import { put } from "@vercel/blob";
import { readFileSync, writeFileSync } from "node:fs";
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

const API_KEY = process.env.MINDLOGIC_API_KEY;
if (!API_KEY) throw new Error("MINDLOGIC_API_KEY not set");

const TTS_URL =
  "https://factchat-cloud.mindlogic.ai/v1/gateway/audio/speech/";
const MODEL = "gemini-2.5-flash-preview-tts";
const VOICE = "Kore";
const PROMPT_PREFIX =
  "Read the following Japanese sentence aloud in a clear, natural, friendly female voice: ";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function tts(text, attempt = 1, model = MODEL) {
  const res = await fetch(TTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: PROMPT_PREFIX + text,
      voice: VOICE,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    if (
      res.status === 400 &&
      attempt >= 3 &&
      model === MODEL &&
      errText.includes("no audio")
    ) {
      console.log(`    fallback to pro model for: ${text}`);
      return tts(text, 1, "gemini-2.5-pro-preview-tts");
    }
    if (attempt < 8) {
      const wait =
        res.status === 429
          ? Math.min(5000 * Math.pow(2, attempt - 1), 60000)
          : 600 * attempt;
      console.log(`    retry ${attempt} (${res.status}): waiting ${wait}ms`);
      await sleep(wait);
      return tts(text, attempt + 1, model);
    }
    throw new Error(`TTS ${res.status}: ${errText}`);
  }
  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

function pcmToWav(
  pcm,
  { sampleRate = 24000, numChannels = 1, bitsPerSample = 16 } = {},
) {
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataLen = pcm.length;
  const buf = Buffer.alloc(44 + dataLen);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataLen, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataLen, 40);
  pcm.copy(buf, 44);
  return buf;
}

const months = [
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
  "2026-09",
  "2026-10",
  "2026-11",
  "2026-12",
];

let totalGenerated = 0;
let totalSkipped = 0;
let totalFailed = 0;
const failures = [];

for (const month of months) {
  console.log(`\n=== ${month} ===`);
  const draftPath = path.resolve(
    __dirname,
    "..",
    "content",
    "drafts",
    `${month}.json`,
  );
  const archive = JSON.parse(readFileSync(draftPath, "utf8"));
  let mutated = false;

  const dates = Object.keys(archive.lessons).sort();
  for (const date of dates) {
    const day = archive.lessons[date];
    for (let i = 0; i < day.sentences.length; i++) {
      const sentence = day.sentences[i];
      if (sentence.audio) {
        totalSkipped++;
        continue;
      }
      const text = sentence.tokens.map((t) => t.jp).join("");
      process.stdout.write(`  ${date} #${i} «${text}» ... `);
      try {
        const pcm = await tts(text);
        const wav = pcmToWav(pcm);
        const dd = date.slice(8, 10);
        const audioPath = `audio/${month}/${dd}-${i}.wav`;
        const result = await put(audioPath, wav, {
          access: "public",
          contentType: "audio/wav",
          addRandomSuffix: false,
          allowOverwrite: true,
        });
        sentence.audio = result.url;
        mutated = true;
        totalGenerated++;
        console.log(`${(wav.length / 1024).toFixed(0)} KB`);
      } catch (err) {
        totalFailed++;
        failures.push({ date, index: i, text, error: err.message });
        console.log(`SKIPPED (${err.message.slice(0, 80)})`);
      }
      await sleep(1500);
    }
    if (mutated) {
      writeFileSync(
        draftPath,
        JSON.stringify(archive, null, 2) + "\n",
        "utf8",
      );
    }
  }

  if (mutated) {
    const archiveResult = await put(
      `lessons/${month}.json`,
      JSON.stringify(archive, null, 2),
      {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      },
    );
    console.log(`  re-uploaded archive: ${archiveResult.url}`);
  } else {
    console.log("  (all sentences already had audio, skipped re-upload)");
  }
  if (mutated) await sleep(15000);
}

console.log(
  `\nDONE. generated: ${totalGenerated}, skipped: ${totalSkipped}, failed: ${totalFailed}`,
);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) {
    console.log(`  ${f.date} #${f.index} «${f.text}»`);
  }
}
