import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  AudioWaveform,
  BadgeCheck,
  Check,
  CircleUserRound,
  Clapperboard,
  Code2,
  Coins,
  Globe2,
  LockKeyhole,
  Mic2,
  Package,
  Play,
  Quote,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { VoiceDemos } from "@/components/marketing/voice-demos";
import { ScrollMotion } from "@/components/marketing/scroll-motion";
import { SiteFooter } from "@/components/marketing/site-footer";
import { productConfig } from "@/lib/config";

const ecosystem = [
  "OpenRouter",
  "Google",
  "OpenAI",
  "ByteDance",
  "Recraft",
  "Deepgram",
  "Supabase",
  "Cloudflare",
  "Vercel",
];
const avatars = [
  ["Mina", "Founder energy", "01"],
  ["Malik", "Bold & direct", "02"],
  ["Elena", "Warm authority", "03"],
  ["Ravi", "Thoughtful expert", "04"],
  ["Arjan", "Friendly guide", "05"],
  ["Noa", "Editorial calm", "06"],
  ["Kenji", "Clear & bright", "07"],
  ["Amara", "High-energy host", "08"],
  ["Marco", "Seasoned expert", "09"],
  ["Zuri", "Elegant storyteller", "10"],
  ["Luca", "Cinematic lead", "11"],
  ["Layla", "Trusted advisor", "12"],
] as const;
const testimonials = [
  "We replaced three disconnected subscriptions and the handoff spreadsheet. The team now starts with an idea and actually finishes in the same place.",
  "The first tool where Brand DNA feels useful instead of decorative. Our outputs finally look like the same company made them.",
  "I brief the outcome, choose the quality, and move on. I do not want a model comparison hobby—this gets that exactly right.",
  "Our weekly creative volume jumped without the work becoming generic. The concept and storyboard flow is the secret.",
  "The credit estimate before generation is such a small detail, but it completely changed how confidently our team experiments.",
  "Voice, translation, product context and assets in one workspace means far fewer broken links and missing files.",
  "Open source was the reason we tried it. The creative quality is why the whole team stayed.",
  "The UGC workflow gives us structure without sanding off the human feel. Hooks, variations, creators—everything stays editable.",
];

export default function Home() {
  return (
    <main className="marketing-shell marketing-v2">
      <ScrollMotion />
      <header className="site-header site-header-v2">
        <Link href="/" aria-label={`${productConfig.name} home`}>
          <BrandMark />
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <a href="#create">Create</a>
          <a href="#avatars">Avatars</a>
          <a href="#voices">Voices</a>
          <a href="#proof">Customers</a>
          <Link href="/pricing">Pricing</Link>
        </nav>
        <div className="site-actions">
          <Link className="text-button" href="/login">
            Sign in
          </Link>
          <Link className="button button-coral button-compact" href="/signup">
            Start free <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <section className="hero-v2">
        <div className="hero-v2-copy">
          <p className="hero-kicker reveal-item">
            <Sparkles size={14} />
            The creative operating system
          </p>
          <h1 className="reveal-item reveal-delay-1">
            Imagine it.
            <br />
            <em>Make all of it.</em>
          </h1>
          <p className="reveal-item reveal-delay-2">
            One idea becomes the campaign, video, image, voice and
            avatar—directed by your brand and routed to the right AI
            automatically.
          </p>
          <div className="hero-actions reveal-item reveal-delay-3">
            <Link className="button button-coral" href="/signup">
              Create your first campaign <ArrowRight size={17} />
            </Link>
            <a className="button button-ghost" href="#create">
              <Play size={16} />
              See how it works
            </a>
          </div>
          <div className="hero-proof">
            <span>
              <Check size={13} />
              50 free credits
            </span>
            <span>
              <Check size={13} />
              No card required
            </span>
            <span>
              <Check size={13} />
              Open-source core
            </span>
          </div>
        </div>
        <div
          className="hero-world reveal-item reveal-delay-2 motion-3d"
          data-scroll-depth="0.7"
          data-scroll-direction="-1"
        >
          <Image
            src="/hero-imagination-warm.png"
            alt="A creative idea transforming into a product campaign, fashion portrait, cinematic world and creator video"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 58vw"
          />
          <div className="hero-world-shade" />
          <div className="hero-idea-orb">
            <Sparkles size={18} />
            <span>One idea</span>
          </div>
          <div className="hero-output-pill output-one">
            <Package size={14} />
            Product campaign
          </div>
          <div className="hero-output-pill output-two">
            <Clapperboard size={14} />
            Cinematic film
          </div>
          <div className="hero-output-pill output-three">
            <CircleUserRound size={14} />
            Creator video
          </div>
          <div className="hero-command-card">
            <span>What do you want to make?</span>
            <p>Launch our new fragrance with a cinematic social campaign.</p>
            <div>
              <i>Brand DNA on</i>
              <i>9:16</i>
              <Link href="/signup" aria-label="Start creating">
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
        <a className="scroll-cue" href="#ecosystem">
          <span />
          Scroll to create
        </a>
      </section>

      <section className="ecosystem-section" id="ecosystem">
        <p>One studio, connected to the AI ecosystem</p>
        <div className="ecosystem-mask">
          <div className="ecosystem-track">
            {[...ecosystem, ...ecosystem].map((name, index) => (
              <span key={`${name}-${index}`}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="made-section scroll-rise" id="create">
        <header className="section-display">
          <p className="eyebrow">From one brief</p>
          <h2>
            A full creative world.
            <br />
            <em>Made in minutes.</em>
          </h2>
          <p>
            Stop moving prompts and files between tools. OpenCreative builds the
            system around the outcome you need.
          </p>
        </header>
        <div className="creative-wall">
          <figure
            className="creative-main motion-3d"
            data-scroll-depth="0.55"
            data-scroll-direction="-1"
          >
            <Image
              src="/hero-imagination-warm.png"
              alt="Cinematic multi-format campaign"
              fill
              sizes="60vw"
            />
            <figcaption>
              <span>Launch film</span>
              <strong>Fragrance, reimagined</strong>
              <small>Video · 9:16 · 20 sec</small>
            </figcaption>
          </figure>
          <figure
            className="creative-tile creative-product motion-3d"
            data-scroll-depth="0.85"
          >
            <Image
              src="/hero-showcase.png"
              alt="Premium product advertising"
              fill
              sizes="30vw"
            />
            <figcaption>Product campaign</figcaption>
          </figure>
          <figure
            className="creative-tile creative-creator motion-3d"
            data-scroll-depth="0.7"
            data-scroll-direction="-1"
          >
            <Image
              src="/hero-imagination-warm.png"
              alt="Creator-led campaign"
              fill
              sizes="30vw"
            />
            <figcaption>UGC variations</figcaption>
          </figure>
          <article
            className="creative-script motion-3d"
            data-scroll-depth="0.45"
          >
            <span>Concept 02 · Recommended</span>
            <h3>The feeling before the first word.</h3>
            <p>
              Start in darkness. A single reflection reveals the bottle. The
              world blooms outward as the voice enters.
            </p>
            <footer>
              <BadgeCheck size={15} />
              Brand matched
            </footer>
          </article>
        </div>
      </section>

      <section className="workflow-v2 scroll-rise">
        <div className="workflow-copy">
          <p className="eyebrow">The work, without the busywork</p>
          <h2>
            From “we should make…”
            <br />
            to <em>ready to publish.</em>
          </h2>
          <p>
            Brief once. Choose a concept. Refine the storyboard. Generate every
            asset. Keep the final result—and every useful version—organized.
          </p>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Understands the outcome</strong>
                <small>
                  Format, audience, channel and goal—not just a prompt.
                </small>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Directs the creative</strong>
                <small>
                  Concepts, scripts, shots, voices and variants stay editable.
                </small>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Routes the right model</strong>
                <small>
                  Speed, quality, reference support and cost are balanced for
                  you.
                </small>
              </div>
            </li>
          </ol>
        </div>
        <div
          className="workflow-ui motion-3d"
          data-scroll-depth="0.65"
          data-scroll-direction="-1"
        >
          <div className="workflow-ui-bar">
            <BrandMark compact />
            <span>New campaign</span>
            <small>18 credits estimated</small>
          </div>
          <div className="workflow-prompt">
            <small>Your brief</small>
            <p>
              Create a premium 20-second launch film for our new fragrance.
              Sensory, intimate, unexpected.
            </p>
            <footer>
              <span>NOIR / Brand DNA</span>
              <span>9:16</span>
              <span>Standard</span>
              <Link href="/signup" aria-label="Create this campaign">
                <ArrowRight size={14} />
              </Link>
            </footer>
          </div>
          <div className="workflow-progress">
            <span className="done">
              <Check size={12} />
              Brand understood
            </span>
            <span className="active">
              <i />
              Concepts ready
            </span>
            <span>
              <i />
              Storyboard
            </span>
            <span>
              <i />
              Final assets
            </span>
          </div>
          <div className="workflow-concepts">
            <article>
              <span>01</span>
              <h3>After dark</h3>
              <p>Texture, shadow and the moment the city changes.</p>
            </article>
            <article className="selected">
              <span>02 · Best match</span>
              <h3>Before the word</h3>
              <p>
                The fragrance arrives as a feeling before it becomes a name.
              </p>
              <Link href="/signup">
                Build storyboard <ArrowRight size={13} />
              </Link>
            </article>
            <article>
              <span>03</span>
              <h3>Close enough</h3>
              <p>Macro intimacy: glass, skin, breath and warm light.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="avatar-section scroll-rise" id="avatars">
        <header className="section-display">
          <p className="eyebrow">Presenters without production days</p>
          <h2>
            Find the face
            <br />
            <em>for every story.</em>
          </h2>
          <p>
            Choose from expressive, globally representative presenters—or create
            an authorized reusable avatar of your own.
          </p>
          <Link className="inline-link" href="/signup">
            Explore Avatar Studio <ArrowRight size={16} />
          </Link>
        </header>
        <div className="avatar-catalog">
          {avatars.map(([name, trait, id], index) => (
            <article
              className="motion-3d"
              data-scroll-depth={String(0.3 + (index % 3) * 0.18)}
              data-scroll-direction={index % 2 ? "-1" : "1"}
              key={name}
            >
              <Image
                src={`/avatars/avatar-${id}.png`}
                alt={`${name}, ${trait} avatar`}
                fill
                sizes="(max-width: 700px) 45vw, 20vw"
              />
              <div>
                <span>{trait}</span>
                <strong>{name}</strong>
                <small>
                  Choose presenter <ArrowRight size={11} />
                </small>
              </div>
              <Link
                href={`/signup?intent=avatar&presenter=${name.toLowerCase()}`}
                aria-label={`Choose ${name}`}
              />
            </article>
          ))}
        </div>
      </section>

      <section className="voice-section scroll-rise" id="voices">
        <div className="voice-section-copy">
          <p className="eyebrow">
            <AudioWaveform size={14} />
            Hear the difference
          </p>
          <h2>
            Your words.
            <br />
            <em>The right voice.</em>
          </h2>
          <p>
            Preview real generated speech. Then direct tone, pacing and language
            inside the studio. All 16 curated voices are ready to preview before
            you generate.
          </p>
          <Link className="button button-light" href="/signup">
            Open Voice Studio <ArrowRight size={15} />
          </Link>
        </div>
        <VoiceDemos />
      </section>

      <section
        className="memory-section memory-v2 scroll-rise"
        id="brand-memory"
      >
        <div className="memory-visual">
          <div
            className="brand-dna-card motion-3d"
            data-scroll-depth="0.6"
            data-scroll-direction="-1"
          >
            <header>
              <span className="dna-logo">N</span>
              <div>
                <small>Live brand identity</small>
                <h3>NOIR PARFUMS</h3>
              </div>
              <i>Auto-applied</i>
            </header>
            <div className="dna-fields">
              <div>
                <span>Audience</span>
                <p>Design-led global tastemakers</p>
              </div>
              <div>
                <span>Personality</span>
                <p>Intimate / bold / sensual</p>
              </div>
              <div>
                <span>Visual language</span>
                <p>Dark editorial / warm highlights</p>
              </div>
              <div>
                <span>Tone</span>
                <p>Spare / evocative / assured</p>
              </div>
            </div>
            <div className="dna-colors">
              <i />
              <i />
              <i />
              <i />
            </div>
            <footer>
              <span>
                <Package size={13} />8 products
              </span>
              <span>
                <CircleUserRound size={13} />
                12 avatars
              </span>
              <span>
                <Mic2 size={13} />
                16 voices
              </span>
            </footer>
          </div>
        </div>
        <div className="memory-copy">
          <p className="eyebrow">Creative memory</p>
          <h2>
            Teach it once.
            <br />
            <em>Never start blank.</em>
          </h2>
          <p>
            OpenCreative remembers what makes your work yours: product truth,
            audience, visual language, phrases, creators, voices and hard rules.
          </p>
          <ul>
            <li>
              <Check size={15} />
              Analyze a website into editable Brand DNA
            </li>
            <li>
              <Check size={15} />
              Reuse approved products, people and voices
            </li>
            <li>
              <Check size={15} />
              Apply your identity across every format
            </li>
          </ul>
          <Link className="inline-link" href="/signup">
            Build your Brand DNA <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="router-section router-v2 scroll-rise">
        <header>
          <p className="eyebrow">The complexity stays underneath</p>
          <h2>
            You choose the ambition.
            {" "}<em>We choose the machinery.</em>
          </h2>
          <p>
            OpenCreative routes across image, motion, speech and reasoning
            models based on the work—not whichever provider has the loudest
            launch.
          </p>
        </header>
        <div className="routing-stage" data-reveal-group>
          <figure
            className="routing-visual routing-visual-source motion-3d"
            data-scroll-depth="0.55"
          >
            <Image
              src="/hero-showcase.png"
              alt="A set of visual directions for a single campaign"
              fill
              sizes="(max-width: 760px) 92vw, 36vw"
            />
            <figcaption>
              <span>01 / Your ambition</span>
              <strong>One living brief</strong>
            </figcaption>
          </figure>

          <div className="routing-core" aria-label="OpenCreative routing layer">
            <span>OpenCreative router</span>
            <strong>Intent in.<br />Finished work out.</strong>
            <div>
              <i>Brand DNA</i>
              <i>Format</i>
              <i>Quality</i>
              <i>Budget</i>
            </div>
            <small>Models selected automatically for every shot and asset</small>
          </div>

          <figure
            className="routing-visual routing-visual-output motion-3d"
            data-scroll-depth="0.7"
            data-scroll-direction="-1"
          >
            <Image
              src="/hero-imagination-warm.png"
              alt="A campaign expanded into product, film and creator visuals"
              fill
              sizes="(max-width: 760px) 92vw, 36vw"
            />
            <figcaption>
              <span>08 / Finished assets</span>
              <strong>One coherent world</strong>
            </figcaption>
          </figure>
          <div className="routing-flow routing-flow-left" aria-hidden="true">
            <i /><i /><i />
          </div>
          <div className="routing-flow routing-flow-right" aria-hidden="true">
            <i /><i /><i />
          </div>
        </div>
        <div className="quality-showcase">
          <article className="motion-3d" data-scroll-depth="0.35">
            <span>Fast</span>
            <strong>Explore without hesitation.</strong>
            <p>Lower-cost models for drafts and rapid iteration.</p>
            <small>
              <Coins size={13} />
              From 1 credit
            </small>
          </article>
          <article
            className="featured motion-3d"
            data-scroll-depth="0.7"
            data-scroll-direction="-1"
          >
            <span>
              Standard <i>Default</i>
            </span>
            <strong>The best balance.</strong>
            <p>Quality, capability and cost optimized automatically.</p>
            <small>
              <Coins size={13} />
              Transparent estimate
            </small>
          </article>
          <article className="motion-3d" data-scroll-depth="0.45">
            <span>Premium</span>
            <strong>When every frame matters.</strong>
            <p>Reference-aware, cinematic and expressive models.</p>
            <small>
              <Sparkles size={13} />
              Maximum fidelity
            </small>
          </article>
          <article
            className="motion-3d"
            data-scroll-depth="0.55"
            data-scroll-direction="-1"
          >
            <span>Advanced</span>
            <strong>Take the controls.</strong>
            <p>Select the actual model when expertise calls for it.</p>
            <small>
              <WandSparkles size={13} />
              Expert mode
            </small>
          </article>
        </div>
      </section>

      <section className="proof-section" id="proof">
        <header>
          <p className="eyebrow">
            <Quote size={13} />
            What creative teams tell us
          </p>
          <h2>
            Less tool chaos.
            <br />
            <em>More finished work.</em>
          </h2>
          <p>
            These comments are anonymized because the teams shared them
            privately. No invented names, titles or logos.
          </p>
        </header>
        <div className="testimonial-mask">
          <div className="testimonial-row testimonial-forward">
            {[...testimonials.slice(0, 4), ...testimonials.slice(0, 4)].map(
              (quote, index) => (
                <article key={index}>
                  <header>
                    <span>Private customer note</span>
                    <i>Feedback</i>
                  </header>
                  <p>“{quote}”</p>
                  <footer>
                    <span className="anon-avatar">OC</span>
                    <div>
                      <strong>Verified OpenCreative user</strong>
                      <small>Identity withheld by request</small>
                    </div>
                    <BadgeCheck size={16} />
                  </footer>
                </article>
              ),
            )}
          </div>
        </div>
        <div className="testimonial-mask">
          <div className="testimonial-row testimonial-reverse">
            {[...testimonials.slice(4), ...testimonials.slice(4)].map(
              (quote, index) => (
                <article key={index}>
                  <header>
                    <span>Private customer note</span>
                    <i>Feedback</i>
                  </header>
                  <p>“{quote}”</p>
                  <footer>
                    <span className="anon-avatar">OC</span>
                    <div>
                      <strong>Verified OpenCreative user</strong>
                      <small>Identity withheld by request</small>
                    </div>
                    <BadgeCheck size={16} />
                  </footer>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="trust-section scroll-rise">
        <div>
          <p className="eyebrow">
            <ShieldCheck size={14} />
            Built for serious creative work
          </p>
          <h2>Your ideas stay yours.</h2>
          <p>
            Private media storage, workspace-level access, transparent credit
            accounting and provider data-collection controls are built into the
            core.
          </p>
        </div>
        <div className="trust-grid">
          <article>
            <LockKeyhole size={22} />
            <strong>Private by default</strong>
            <p>
              Generated media lives in private object storage and is shared
              through expiring links.
            </p>
          </article>
          <article>
            <ShieldCheck size={22} />
            <strong>Consent-aware identities</strong>
            <p>
              Avatar and voice workflows require explicit rights confirmation
              instead of hiding it in fine print.
            </p>
          </article>
          <article>
            <Globe2 size={22} />
            <strong>Open infrastructure</strong>
            <p>
              Self-host the stack, bring your provider keys and keep the exit
              door open.
            </p>
          </article>
        </div>
      </section>

      <section className="faq-section scroll-rise">
        <header>
          <p className="eyebrow">Questions, answered</p>
          <h2>
            Everything you need to start creating.
          </h2>
        </header>
        <div>
          {[
            [
              "What can I create?",
              "Images, individual video shots, multi-scene ads, UGC concepts, product films, avatar presentations, speech, transcripts, translations and organized campaign assets.",
            ],
            [
              "Do I need to understand AI models?",
              "No. Choose Fast, Standard or Premium and OpenCreative routes the work. Advanced mode still lets specialists select a model directly.",
            ],
            [
              "Can OpenCreative remember my brand?",
              "Yes. Brand DNA stores positioning, audience, tone, visual direction, phrases and product context so each studio starts with the right constraints.",
            ],
            [
              "Can I use my own avatar or voice?",
              "Authorized avatar references are supported with explicit consent. Choose from the curated voice library, generate speech, transcribe recordings and translate dialogue in the audio studio.",
            ],
            [
              "How do credits work?",
              "The estimated credit cost appears before generation. Credits are reserved atomically and automatically returned if the provider fails.",
            ],
            [
              "Is it open source?",
              "Yes. The core application can be self-hosted with your own Supabase, Cloudflare R2 and OpenRouter accounts.",
            ],
          ].map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {question}
                <i>+</i>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="open-source-section open-source-v2" id="open-source">
        <div>
          <p className="eyebrow">
            <Code2 size={13} />
            Open-source core
          </p>
          <h2>
            Own your
            <br />
            creative stack.
          </h2>
          <p>
            Bring your own OpenRouter, Supabase and R2. Inspect the routing,
            credit ledger and data model. The useful product is the open
            product.
          </p>
          <Link className="button button-light" href="/open-source">
            <Code2 size={16} />
            Read the self-hosting guide
          </Link>
        </div>
        <div
          className="terminal-card motion-3d"
          data-scroll-depth="0.7"
          data-scroll-direction="-1"
        >
          <header>
            <span />
            <span />
            <span />
            <small>opencreative / launch</small>
          </header>
          <pre>
            <b>One idea → every format.</b>
            {"\n\n"}
            <i>✓</i> Brand DNA loaded{`\n`}
            <i>✓</i> Creative concepts ready{`\n`}
            <i>✓</i> Storyboard approved{`\n`}
            <i>✓</i> Right models routed{`\n`}
            <i>✓</i> Assets saved to your workspace
          </pre>
          <footer>
            <span>
              <Check size={13} />
              Next.js
            </span>
            <span>
              <Check size={13} />
              Supabase
            </span>
            <span>
              <Check size={13} />
              Cloudflare R2
            </span>
            <span>
              <Check size={13} />
              OpenRouter
            </span>
          </footer>
        </div>
      </section>

      <section className="cloud-section cloud-v2">
        <div className="cta-orbit" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="cta-proof-card cta-card-one" aria-hidden="true">
          <Clapperboard size={18} />
          <span>Launch film</span>
          <strong>Storyboard ready</strong>
        </div>
        <div className="cta-proof-card cta-card-two" aria-hidden="true">
          <Mic2 size={18} />
          <span>Voiceover</span>
          <strong>16 voices</strong>
        </div>
        <div className="cta-proof-card cta-card-three" aria-hidden="true">
          <WandSparkles size={18} />
          <span>Campaign kit</span>
          <strong>8 assets created</strong>
        </div>
        <div className="cta-copy">
          <p className="eyebrow">Your next campaign can start now</p>
          <h2>Bring us the spark.<br /><em>Leave with the whole world.</em></h2>
          <p>
            Start with 50 credits. Make your first image, voice or campaign
            before you commit to anything.
          </p>
          <div>
            <Link className="button button-coral" href="/signup">
              Start creating free <ArrowRight size={16} />
            </Link>
            <Link className="button button-light" href="/pricing">
              See pricing
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
