import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !publicKey)
  throw new Error("Supabase public environment is incomplete.");

const email = process.env.SMOKE_EMAIL;
const password = process.env.SMOKE_PASSWORD;
if (!email || !password)
  throw new Error(
    "Set SMOKE_EMAIL and SMOKE_PASSWORD to an existing confirmed test account.",
  );
const cookieJar = new Map();
const auth = createServerClient(url, publicKey, {
  cookies: {
    getAll: () => [...cookieJar].map(([name, value]) => ({ name, value })),
    setAll: (cookies) =>
      cookies.forEach(({ name, value }) => cookieJar.set(name, value)),
  },
});

const { data: signup, error: signupError } = await auth.auth.signInWithPassword(
  {
    email,
    password,
  },
);
if (signupError) throw signupError;
if (!signup.session || !signup.user)
  throw new Error("The smoke account could not sign in.");

const { data: membership, error: membershipError } = await auth
  .from("workspace_members")
  .select("workspace_id,role")
  .eq("user_id", signup.user.id)
  .single();
if (membershipError || !membership)
  throw membershipError || new Error("Workspace trigger did not run.");
const { data: wallet, error: walletError } = await auth
  .from("credit_wallets")
  .select("balance")
  .eq("workspace_id", membership.workspace_id)
  .single();
if (walletError || wallet?.balance !== 50)
  throw walletError || new Error("Welcome credits were not provisioned.");

const cookie = [...cookieJar]
  .map(([name, value]) => `${name}=${value}`)
  .join("; ");
const commandResponse = await fetch("http://localhost:3000/api/command", {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({
    prompt:
      "Create a ten second cinematic product launch video for a new fragrance.",
  }),
});
const command = await commandResponse.json();
if (!commandResponse.ok || !command.route)
  throw new Error(`Command workflow failed (${commandResponse.status}).`);

const speechResponse = await fetch(
  "http://localhost:3000/api/generate/speech",
  {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      text: "OpenCreative end to end smoke test.",
      voice: "Kore",
      speed: 1,
      quality: "standard",
      idempotencyKey: crypto.randomUUID(),
    }),
  },
);
const speech = await speechResponse.json();
if (!speechResponse.ok || speech.status !== "completed" || !speech.url)
  throw new Error(`Speech workflow failed (${speechResponse.status}).`);

const mediaResponse = await fetch(speech.url);
if (
  !mediaResponse.ok ||
  !(mediaResponse.headers.get("content-type") || "").includes("audio")
)
  throw new Error("Stored speech asset is not downloadable audio.");
console.log(
  JSON.stringify({
    database: "ready",
    auth: "ready",
    commandRouting: "ready",
    speechGeneration: "ready",
    privateStorage: "ready",
  }),
);

await fetch(`http://localhost:3000/api/assets/${speech.assetId}`, {
  method: "DELETE",
  headers: { Cookie: cookie },
});
await auth.auth.signOut();
