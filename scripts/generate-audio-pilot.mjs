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

async function tts(text, attempt = 1) {
  const res = await fetch(TTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      input: PROMPT_PREFIX + text,
      voice: VOICE,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    if (attempt < 4) {
      const wait = 500 * attempt;
      console.log(`  retry ${attempt} (${res.status}): waiting ${wait}ms`);
      await sleep(wait);
      return tts(text, attempt + 1);
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

const month = "2026-05";
const draftPath = path.resolve(
  __dirname,
  "..",
  "content",
  "drafts",
  `${month}.json`,
);
const archive = JSON.parse(readFileSync(draftPath, "utf8"));

const targetDates = ["2026-05-01", "2026-05-02", "2026-05-03"];

for (const date of targetDates) {
  const day = archive.lessons[date];
  if (!day) {
    console.log(`skip ${date} (not in archive)`);
    continue;
  }
  for (let i = 0; i < day.sentences.length; i++) {
    const sentence = day.sentences[i];
    const text = sentence.tokens.map((t) => t.jp).join("");
    process.stdout.write(`tts ${date} #${i} «${text}» ... `);
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
    console.log(`${(wav.length / 1024).toFixed(1)} KB → ${result.url}`);
    await sleep(300);
  }
}

writeFileSync(draftPath, JSON.stringify(archive, null, 2) + "\n", "utf8");
console.log(`updated draft: ${draftPath}`);

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
console.log(`re-uploaded archive: ${archiveResult.url}`);
