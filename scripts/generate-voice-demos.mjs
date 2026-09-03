import { loadEnvFile } from "node:process";
import { mkdir, writeFile } from "node:fs/promises";

loadEnvFile(".env.local");

const demos = [
  ["maya", "Leda", "Speak as a confident adult woman with a warm Indian English accent. Natural commercial delivery with a thoughtful pause before the final phrase. Transcript: Build the campaign around the feeling, then let every format carry it forward."],
  ["theo", "Puck", "Speak as an adult man with a natural American English accent. Bright, conversational, lightly energetic. Transcript: Start with the product truth, find the human hook, and make every second earn attention."],
  ["ellis", "Algieba", "Speak as an adult man with a polished British English accent. Measured, cinematic, and understated. Transcript: A memorable launch does not shout. It gives the audience a reason to lean closer."],
  ["clara", "Aoede", "Speak as an adult woman with a modern British English accent. Editorial, poised, with precise articulation. Transcript: Shape the idea once, then let it travel beautifully across every screen."],
  ["priya", "Kore", "Speak as an adult Indian woman in natural Hindi. Expressive, assured, and warm, with a gentle rise on the final sentence. Transcript: एक विचार से पूरी कहानी बनाइए, अपनी भाषा और अपनी आवाज़ में।"],
  ["dev", "Orus", "Speak as an adult Indian man in natural Hindi. Clear, grounded, and professional, with an informative delivery. Transcript: सही संदेश को सही आवाज़ दीजिए, और हर ग्राहक तक भरोसे के साथ पहुँचिए।"],
  ["lucia", "Callirrhoe", "Speak as an adult woman in European Spanish. Elegant, expressive, and intimate. Transcript: Convierte una idea valiente en una campaña que la gente quiera recordar."],
  ["mateo", "Enceladus", "Speak as an adult man in Latin American Spanish. Friendly, upbeat, and spontaneous. Transcript: Tu producto ya tiene una historia; ahora vamos a darle ritmo, imagen y una voz propia."],
  ["camille", "Despina", "Speak as an adult woman in metropolitan French. Polished, calm, and luxurious. Transcript: Une seule idée peut devenir un univers cohérent, élégant et immédiatement reconnaissable."],
  ["luc", "Alnilam", "Speak as an adult man in metropolitan French. Direct, confident, and measured. Transcript: Donnez une direction claire à la création, puis laissez chaque format amplifier le message."],
  ["sora", "Achernar", "Speak as an adult Japanese woman in natural Japanese. Soft, composed, and optimistic. Transcript: ひとつのアイデアから、映像も音声も、心に残るひとつの世界へ。"],
  ["kenji", "Fenrir", "Speak as an adult Japanese man in natural Japanese. Focused, modern, and energetic without rushing. Transcript: 商品の魅力をまっすぐ伝え、見る人の次の行動につなげます。"],
];

function waveHeader(byteLength) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + byteLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(24000, 24);
  header.writeUInt32LE(48000, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(byteLength, 40);
  return header;
}

if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is required.");
await mkdir("public/audio", { recursive: true });
for (const [fileName, voice, input] of demos) {
  const response = await fetch("https://openrouter.ai/api/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_APP_URL || "https://opencreative.vercel.app",
      "X-Title": "OpenCreative voice demos",
    },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-tts-preview",
      input,
      voice,
      response_format: "pcm",
      provider: { allow_fallbacks: true, data_collection: "deny" },
    }),
  });
  if (!response.ok) throw new Error(`${fileName}: ${response.status} ${await response.text()}`);
  const pcm = Buffer.from(await response.arrayBuffer());
  await writeFile(`public/audio/${fileName}.wav`, Buffer.concat([waveHeader(pcm.length), pcm]));
  console.log(`${fileName}.wav ${pcm.length} bytes`);
}
