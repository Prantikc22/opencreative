import { mkdir, writeFile } from "node:fs/promises";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");

const samples = [
  {
    file: "maya.wav",
    voice: "Kore",
    text: "Create without limits. Turn one idea into a complete campaign, in your own voice.",
  },
  {
    file: "theo.wav",
    voice: "Puck",
    text: "From the first concept to the final cut, OpenCreative keeps every step in one studio.",
  },
  {
    file: "sora.wav",
    voice: "Aoede",
    text: "Translate, narrate, and tell your story with a voice that feels naturally yours.",
  },
  {
    file: "arlo.wav",
    voice: "Charon",
    text: "When every frame matters, choose a voice with cinematic presence.",
  },
  { file: "nia.wav", voice: "Leda", text: "Fresh ideas move fast. Let’s turn this one into something people remember." },
  { file: "dev.wav", voice: "Orus", text: "Clear direction, polished delivery, and every creative asset in one place." },
  { file: "lucia.wav", voice: "Callirrhoe", text: "A beautiful story begins with the confidence to make the unexpected choice." },
  { file: "kenji.wav", voice: "Fenrir", text: "Make every instruction clear, measured, and easy for your audience to follow." },
  { file: "amina.wav", voice: "Autonoe", text: "Tell your story with warmth, clarity, and a voice your audience can trust." },
  { file: "camille.wav", voice: "Despina", text: "Luxury is not louder. It is the detail people feel before they understand it." },
  { file: "mateo.wav", voice: "Enceladus", text: "Here’s the product I keep reaching for, and the reason it surprised me." },
  { file: "priya.wav", voice: "Gacrux", text: "Learn the idea once, then put it into practice with a simple creative workflow." },
  { file: "jonas.wav", voice: "Iapetus", text: "Move from strategy to finished creative without losing the original intent." },
  { file: "zuri.wav", voice: "Pulcherrima", text: "Stop the scroll with a story that feels alive from the very first second." },
  { file: "ana.wav", voice: "Umbriel", text: "Bring a little more energy, optimism, and human warmth to every campaign." },
  { file: "eli.wav", voice: "Zephyr", text: "Your next idea is ready. Let’s make it sound as good as it looks." },
];

function wavFromPcm(pcm, sampleRate = 24000, channels = 1, bitsPerSample = 16) {
  const header = Buffer.alloc(44);
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE((channels * bitsPerSample) / 8, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

await mkdir("public/audio", { recursive: true });

for (const sample of samples) {
  const response = await fetch("https://openrouter.ai/api/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_APP_URL || "http://localhost:3000",
      "X-Title": "OpenCreative",
    },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-tts-preview",
      input: sample.text,
      voice: sample.voice,
      response_format: "pcm",
      provider: { data_collection: "deny" },
    }),
  });
  if (!response.ok)
    throw new Error(
      `Speech sample failed (${response.status}): ${(await response.text()).slice(0, 240)}`,
    );
  const pcm = Buffer.from(await response.arrayBuffer());
  await writeFile(`public/audio/${sample.file}`, wavFromPcm(pcm));
  console.log(`Created public/audio/${sample.file}`);
}
