export const SEO_REVIEW_DATE = "2026-09-13";

export type FaqItem = { question: string; answer: string };
export type ContentSection = { heading: string; paragraphs: string[]; bullets?: string[] };

export type AlternativePage = {
  slug: string;
  competitor: string;
  metaTitle: string;
  title: string;
  description: string;
  intro: string;
  quickAnswer: string;
  openCreativeFit: string[];
  specialistFit: string[];
  sections: ContentSection[];
  faq: FaqItem[];
  officialUrl: string;
};

export const alternativePages: Record<string, AlternativePage> = {
  elevenlabs: {
    slug: "elevenlabs",
    competitor: "ElevenLabs",
    metaTitle: "Open-source ElevenLabs alternative for campaigns",
    title: "OpenCreative vs ElevenLabs: an open-source alternative for full campaigns",
    description: "Compare OpenCreative and ElevenLabs for AI voice, dubbing, agents, video, images, open-source access, and connected campaign production.",
    intro: "ElevenLabs is a voice and audio specialist. OpenCreative is a broader, open-source creative workspace that connects speech and localization with images, video, avatars, brand context, assets, and customer agents.",
    quickAnswer: "Choose OpenCreative when voice is one part of a larger campaign and you want the surrounding creative workflow in one workspace. Choose ElevenLabs when advanced voice cloning or a voice-first specialist stack is the central requirement.",
    openCreativeFit: [
      "One brief across image, video, speech, avatars, assets, and agents",
      "Open-source core with self-hosting instructions",
      "Speech, transcription, translation, and dubbing workflow",
      "Shared brands, products, projects, and credit ledger",
      "API and MCP access for agent-driven production",
    ],
    specialistFit: [
      "Specialist voice creation and audio tooling",
      "Instant and professional voice-cloning products",
      "Mature voice library and voice-focused controls",
      "Dubbing and conversational voice-agent workflows",
    ],
    sections: [
      {
        heading: "The meaningful difference is workflow scope",
        paragraphs: [
          "Both products can sit inside an audio workflow, but they start from different assumptions. ElevenLabs starts with voice. OpenCreative starts with the campaign brief, then carries its context into voice, stills, video, avatars, localization, assets, and customer support.",
          "That distinction matters when the real cost is repeated setup: copying the same product facts into several tools, losing approved references, and trying to reconnect outputs at the end. OpenCreative is designed to keep those decisions attached to one workspace.",
        ],
      },
      {
        heading: "Where ElevenLabs remains the stronger fit",
        paragraphs: [
          "OpenCreative currently uses a curated provider voice library. It does not create custom voice clones through OpenRouter. If verified voice cloning is mandatory today, ElevenLabs provides dedicated instant and professional cloning workflows and is the more complete specialist choice.",
          "This comparison is therefore about choosing the right operating model, not pretending the products are identical. Teams can also use a voice specialist alongside OpenCreative when a campaign requires a capability outside the current open-source core.",
        ],
      },
      {
        heading: "Where OpenCreative earns its place",
        paragraphs: [
          "OpenCreative is strongest when the voiceover has to become a translated video, a set of campaign stills, an avatar-led explainer, reusable brand assets, and a grounded support agent. The project, brand identity, model choice, generation history, and credits remain visible in one system.",
          "Developers can inspect the source, self-host the application, call its API, or connect agent clients through MCP. That makes it suitable for teams that care about workflow ownership as much as individual model output.",
        ],
      },
    ],
    faq: [
      { question: "Is OpenCreative a free ElevenLabs alternative?", answer: "OpenCreative includes a free creative plan and an open-source core. It is a broader creative workspace, not a one-for-one replacement for every ElevenLabs voice feature." },
      { question: "Does OpenCreative support text to speech and dubbing?", answer: "Yes. OpenCreative includes provider-backed speech, transcription, translation, and an audio or video dubbing workflow with a broad language selector." },
      { question: "Can OpenCreative clone my voice?", answer: "Not currently. OpenRouter's normalized speech endpoint supports provider voices but does not create a custom clone. OpenCreative documents this limitation rather than presenting preset voices as clones." },
      { question: "Can I self-host OpenCreative?", answer: "Yes. The core is published under the MIT license with setup instructions for Next.js, Supabase, Cloudflare R2, and OpenRouter." },
    ],
    officialUrl: "https://elevenlabs.io/docs/overview/intro",
  },
  heygen: {
    slug: "heygen",
    competitor: "HeyGen",
    metaTitle: "Open-source HeyGen alternative for campaigns",
    title: "OpenCreative vs HeyGen: an open-source alternative for campaign creation",
    description: "Compare OpenCreative and HeyGen for AI avatars, video localization, voice, image generation, open-source access, and complete campaign workflows.",
    intro: "HeyGen is built around avatar-led video and video translation. OpenCreative connects avatar and video work to a wider campaign system that also includes images, voice, brand identities, reusable assets, and customer agents.",
    quickAnswer: "Choose OpenCreative when you need an open-source workspace for the whole campaign. Choose HeyGen when a polished, avatar-first presenter workflow is the job's main requirement.",
    openCreativeFit: [
      "Campaign creation across image, video, voice, avatar, and agents",
      "Open-source core and self-hosting path",
      "Reusable brand, product, voice, and avatar identities",
      "Model routing instead of a single-model workflow",
      "API, MCP, projects, assets, and transparent credit estimates",
    ],
    specialistFit: [
      "Avatar-first presenter video production",
      "Dedicated video translation workflows",
      "A specialist experience for business presenter content",
      "Managed SaaS operation without self-hosting work",
    ],
    sections: [
      {
        heading: "Start with the final deliverable",
        paragraphs: [
          "If the final deliverable is primarily a presenter video, a specialist avatar platform can be the shortest route. If that video is one piece of a launch that also needs product stills, social variants, narration, translated assets, and a support experience, the surrounding workflow becomes more important.",
          "OpenCreative keeps those outputs attached to the same brief and identity library. A team can move from product context to campaign production without rebuilding the project in a separate tool for each format.",
        ],
      },
      {
        heading: "Open source changes the ownership model",
        paragraphs: [
          "OpenCreative's core can be inspected, extended, and self-hosted. You choose the Supabase project, object storage, and model-routing credentials. That is useful for technical teams that want control over the application layer and their workflow data.",
          "Self-hosting also creates responsibility. Your team must manage secrets, migrations, storage policies, provider terms, safety controls, and deployment. A managed specialist is simpler when that operational work is not part of the plan.",
        ],
      },
      {
        heading: "What to test before deciding",
        paragraphs: [
          "Run the same real brief through both products. Compare presenter quality, pronunciation, translation review, brand consistency, export requirements, and the time needed to create the rest of the campaign. A demo clip alone will not reveal the full production cost.",
          "Also verify current provider availability and commercial-use terms for the exact models you intend to use. AI media capabilities and limits change frequently.",
        ],
      },
    ],
    faq: [
      { question: "Is OpenCreative an open-source HeyGen alternative?", answer: "OpenCreative is an open-source alternative for teams that need avatars within a broader campaign workflow. It is not a feature-for-feature copy of HeyGen's managed avatar platform." },
      { question: "Does OpenCreative create AI avatar videos?", answer: "Yes. OpenCreative includes avatar generation and talking-character workflows, alongside video, voice, image, and localization tools." },
      { question: "Does OpenCreative support video translation?", answer: "OpenCreative includes transcription, text translation, speech generation, and a dubbing workflow. Teams should review the translated script and output before publishing." },
      { question: "Which option is better for developers?", answer: "OpenCreative is designed for inspection and extension through its MIT-licensed core, REST API, and MCP server. The better choice still depends on the exact avatar quality and operational model required." },
    ],
    officialUrl: "https://www.heygen.com/",
  },
  higgsfield: {
    slug: "higgsfield",
    competitor: "Higgsfield",
    metaTitle: "Open-source Higgsfield alternative for campaigns",
    title: "OpenCreative vs Higgsfield: an alternative for connected AI campaigns",
    description: "Compare OpenCreative and Higgsfield for AI video, images, ads, UGC, avatars, open-source access, and multi-format campaign production.",
    intro: "Higgsfield is known for stylized AI image and video creation. OpenCreative is built for teams that want those visual outputs connected to voice, avatars, localization, brand memory, assets, and customer agents.",
    quickAnswer: "Choose OpenCreative for a connected, open-source campaign workspace. Choose Higgsfield when a specialist visual-generation experience and its current visual models are the main attraction.",
    openCreativeFit: [
      "Image, video, UGC, ads, voice, avatar, and agent workflows",
      "Open-source application core",
      "A shared brief and identity system across formats",
      "Projects, asset history, estimates, and one credit ledger",
      "API and MCP access for automation",
    ],
    specialistFit: [
      "Visual-first image and video generation",
      "Stylized camera and social-content workflows",
      "A focused interface for rapid visual experimentation",
      "Managed access to its current model lineup",
    ],
    sections: [
      {
        heading: "Visual generation is only one production layer",
        paragraphs: [
          "A strong visual model can create the hero shot, but a launch usually needs more: product variants, voiceover, localized scripts, a presenter, organized assets, and consistent product facts. OpenCreative treats those pieces as one campaign rather than isolated generations.",
          "That wider scope is the reason to consider OpenCreative. If you only need fast visual exploration, a specialist may offer a more concentrated experience.",
        ],
      },
      {
        heading: "Model choice and application choice are different",
        paragraphs: [
          "Teams often compare the quality of one model while overlooking the application around it. OpenCreative routes work through provider models while keeping the operational layer open: briefs, brands, products, assets, generation records, and integrations.",
          "Because model availability changes, test the exact image and video operations you use most. Evaluate reference handling, continuity, motion control, turnaround time, and failure behavior rather than relying on a general quality label.",
        ],
      },
      {
        heading: "When OpenCreative is the practical choice",
        paragraphs: [
          "OpenCreative fits agencies and marketing teams that repeatedly translate one product truth into many formats. The same workspace can hold a product identity, produce campaign visuals, add narration, create an avatar-led variant, and ground a customer agent in approved knowledge.",
          "Its open-source core also gives technical teams a path to customize the workflow without waiting for a closed product roadmap.",
        ],
      },
    ],
    faq: [
      { question: "Is OpenCreative a Higgsfield alternative?", answer: "Yes for teams seeking a broader AI campaign workspace. Higgsfield remains a visual specialist, so the best choice depends on whether depth in visual creation or cross-format workflow matters more." },
      { question: "Can OpenCreative make UGC ads?", answer: "Yes. It includes guided UGC and advertising workflows connected to image, video, avatar, and brand context." },
      { question: "Is OpenCreative open source?", answer: "Yes. The application core is available under the MIT license with local and hosted deployment instructions." },
      { question: "Does OpenCreative use one AI model?", answer: "No. It uses model routing so different creative operations can use suitable provider models while remaining inside one workspace." },
    ],
    officialUrl: "https://higgsfield.ai/",
  },
  runway: {
    slug: "runway",
    competitor: "Runway",
    metaTitle: "Open-source Runway alternative for marketing",
    title: "OpenCreative vs Runway: an open-source alternative for marketing workflows",
    description: "Compare OpenCreative and Runway for AI video, images, campaign workflows, voice, avatars, agents, APIs, and open-source deployment.",
    intro: "Runway is a specialist generative-video and filmmaking platform. OpenCreative is a broader campaign operating system that connects video with images, voice, avatars, localization, reusable identities, and agents.",
    quickAnswer: "Choose OpenCreative when campaign breadth, workflow context, and an open-source application layer matter. Choose Runway when specialist generative filmmaking is the primary requirement.",
    openCreativeFit: [
      "A connected marketing workflow across six creative systems",
      "Open-source core and self-hosting",
      "Brand, product, voice, and avatar identities",
      "Campaign builder, assets, generation history, API, and MCP",
      "Speech, translation, dubbing, and customer agents",
    ],
    specialistFit: [
      "Generative filmmaking and visual production",
      "A concentrated video creation and editing experience",
      "Managed access to Runway's current video models",
      "A mature specialist workflow for visual storytellers",
    ],
    sections: [
      {
        heading: "A video tool and a campaign system solve different problems",
        paragraphs: [
          "The right specialist can be ideal when every decision serves the film. OpenCreative is intended for work where the film must remain consistent with campaign stills, product information, voiceover, localization, avatar variants, and customer-facing knowledge.",
          "The value is not simply having more buttons. It is carrying approved context between operations so the campaign remains coherent and auditable.",
        ],
      },
      {
        heading: "Use real production criteria",
        paragraphs: [
          "Compare both products with a complete brief and fixed acceptance criteria. Review visual quality, reference fidelity, continuity between shots, iteration speed, output formats, failure handling, and total cost for the finished campaign.",
          "Model catalogs change quickly. Confirm the current model, plan, limits, and commercial terms on each official product before committing to a production schedule.",
        ],
      },
      {
        heading: "Why developers may prefer OpenCreative",
        paragraphs: [
          "OpenCreative exposes an API and MCP server, and its MIT-licensed core can be self-hosted with your own data and storage services. This creates a practical base for teams that want to automate creative production or integrate it with internal systems.",
          "That flexibility comes with operational responsibility. Teams that want a fully managed filmmaking environment may prefer a specialist platform.",
        ],
      },
    ],
    faq: [
      { question: "Is OpenCreative an open-source Runway alternative?", answer: "OpenCreative is an open-source alternative for connected campaign work. Runway is more narrowly focused on generative filmmaking, so it is not a feature-for-feature comparison." },
      { question: "Can OpenCreative generate AI video?", answer: "Yes. It includes text-to-video, image-to-video, product-video, UGC, scene, and campaign workflows routed through available provider models." },
      { question: "Can OpenCreative keep brand context between video and images?", answer: "Yes. Brand and product identities, references, projects, and generated assets are designed to remain available across creative operations." },
      { question: "Can I connect OpenCreative to coding agents?", answer: "Yes. OpenCreative includes REST endpoints and an MCP server with OAuth and scoped API-key options." },
    ],
    officialUrl: "https://runwayml.com/",
  },
};

export type ResourceArticle = {
  slug: string;
  metaTitle: string;
  title: string;
  description: string;
  kicker: string;
  intro: string;
  readTime: string;
  sections: ContentSection[];
  faq: FaqItem[];
};

export const resourceArticles: Record<string, ResourceArticle> = {
  "open-source-ai-creative-studio": {
    slug: "open-source-ai-creative-studio",
    metaTitle: "Open-source AI creative studio: practical guide",
    title: "What an open-source AI creative studio should actually give you",
    description: "A practical guide to evaluating an open-source AI creative studio: workflow ownership, model routing, storage, safety, deployment, and real limitations.",
    kicker: "OPEN-SOURCE GUIDE",
    intro: "Open source should mean more than a public landing page or a collection of model links. A useful creative studio gives teams an inspectable application layer for briefs, identities, generations, assets, permissions, and provider integrations.",
    readTime: "8 minute guide",
    sections: [
      {
        heading: "Start with the application layer",
        paragraphs: [
          "Most AI media models solve one operation: produce an image, animate a frame, synthesize speech, or transcribe audio. Production work needs an application around those calls. It must authenticate users, isolate workspaces, estimate cost, preserve references, store outputs, and make failures understandable.",
          "An open-source creative studio should expose that layer. You should be able to inspect how a prompt becomes a provider request, where files are stored, how credits are reserved and returned, and which data belongs to each workspace.",
        ],
        bullets: [
          "Readable source and a clear license",
          "Documented environment variables and migrations",
          "Workspace isolation and private media storage",
          "Provider adapters that can be replaced",
          "Generation history, estimates, and failure states",
        ],
      },
      {
        heading: "Self-hosting is control plus responsibility",
        paragraphs: [
          "Self-hosting lets a team select its database, storage region, provider accounts, deployment platform, and retention practices. It can also make internal integration easier because the application is not a black box.",
          "It does not make third-party model processing disappear. If a workflow calls a hosted model provider, that provider still processes the submitted request. Review every provider's terms, retention controls, commercial-use rules, and regional availability.",
        ],
      },
      {
        heading: "Evaluate the whole workflow",
        paragraphs: [
          "A broad feature list is less useful than one complete test. Take a real product brief and produce the campaign image, short video, voiceover, translated variant, presenter version, and final asset package. Count how often context must be copied and how easily a reviewer can find the source and output.",
          "Also test the unglamorous paths: a failed provider job, an exhausted wallet, a canceled subscription, an expired signed URL, and a user who returns after onboarding. Reliable state handling is part of creative quality.",
        ],
      },
      {
        heading: "Know the current boundaries",
        paragraphs: [
          "OpenCreative's core connects image, video, avatar, speech, transcription, translation, dubbing, assets, projects, and agents. Music depends on provider capacity. Custom voice cloning needs a separate, consent-aware provider integration because OpenRouter's normalized speech endpoint does not create clones.",
          "Clear limitations are a sign of a usable system. They let a team decide where to extend the stack and where a specialist product remains appropriate.",
        ],
      },
    ],
    faq: [
      { question: "Does open source mean AI generation is free?", answer: "No. The application source can be open while model, database, storage, email, and hosting providers charge for usage." },
      { question: "Can an open-source studio keep media private?", answer: "Yes, if it uses private object storage, short-lived signed links, correct access policies, and tenant-aware database rules. Those controls must still be configured and maintained." },
      { question: "What does OpenCreative use?", answer: "The reference stack uses Next.js, Supabase, Cloudflare R2, and OpenRouter, with optional billing and transactional-email providers." },
    ],
  },
  "ai-video-localization-workflow": {
    slug: "ai-video-localization-workflow",
    metaTitle: "AI video localization workflow: 5 practical steps",
    title: "A practical AI video localization workflow for marketing teams",
    description: "Learn how to transcribe, translate, review, synthesize, and publish localized marketing video without losing brand meaning or measurement.",
    kicker: "LOCALIZATION PLAYBOOK",
    intro: "Good localization is not a one-click language swap. The reliable workflow separates transcription, translation, review, speech generation, timing, and market approval so each decision can be checked.",
    readTime: "9 minute guide",
    sections: [
      {
        heading: "1. Freeze the source message",
        paragraphs: [
          "Approve the source script before creating language variants. Capture product names, claims, prices, legal lines, pronunciation notes, and phrases that must not be translated. This becomes the reference for every market.",
          "If the source is existing audio or video, transcribe it and correct names, numbers, and punctuation first. A translation built on a faulty transcript multiplies the error.",
        ],
      },
      {
        heading: "2. Translate for meaning and timing",
        paragraphs: [
          "Literal translation can create awkward speech or a sentence that no longer fits the scene. Ask for the same intent, reading level, call to action, and approximate duration. Keep a separate record of changes required by local policy or product availability.",
          "Use BCP-47 language tags when locale matters. For example, Brazilian and European Portuguese may need different vocabulary, pronunciation, and review even though both are Portuguese.",
        ],
      },
      {
        heading: "3. Put a human review before synthesis",
        paragraphs: [
          "A fluent reviewer should check meaning, tone, product accuracy, pronunciation, and cultural fit before expensive media generation. Give the reviewer the original brief and visual context, not only the translated text.",
          "Record approval at the script level. If the source changes later, mark affected translations for review instead of quietly reusing an outdated version.",
        ],
      },
      {
        heading: "4. Generate, time, and quality-check the voice",
        paragraphs: [
          "Select a voice suited to the target language and market. Generate a short sample first, then review names, numbers, pacing, emotion, and pauses. A voice can pronounce the words correctly and still feel wrong for the audience.",
          "Fit the approved audio to the edit. If timing is tight, revise the translated script rather than stretching speech until it sounds unnatural. Review the final mix with music and effects present.",
        ],
      },
      {
        heading: "5. Publish variants as one campaign",
        paragraphs: [
          "Keep each localized output attached to the source brief, market, language, reviewer, and final export. Use consistent file names and retain the approved script beside the media.",
          "Measure each market separately, but keep the reporting structure shared. This makes it easier to learn whether performance differences came from the offer, creative, language, or channel.",
        ],
      },
    ],
    faq: [
      { question: "Can AI fully automate video localization?", answer: "AI can accelerate transcription, translation, and speech generation, but a fluent human should review product meaning, legal claims, pronunciation, and cultural fit before publication." },
      { question: "What language code format should I use?", answer: "Use ISO language codes or BCP-47 tags when you need a regional locale, such as en, hi, es-MX, or pt-BR." },
      { question: "Does OpenCreative preserve the original speaker's voice?", answer: "OpenCreative currently uses selected provider voices. It does not claim to clone or preserve the original speaker's identity." },
    ],
  },
  "ai-marketing-studio-guide": {
    slug: "ai-marketing-studio-guide",
    metaTitle: "How to choose an AI marketing studio",
    title: "How to choose an AI marketing studio without buying six disconnected tools",
    description: "A practical framework for choosing AI marketing software across image, video, voice, avatars, localization, assets, agents, and APIs.",
    kicker: "BUYER'S GUIDE",
    intro: "The best AI marketing stack is not the one with the longest model list. It is the one that turns an approved brief into usable campaign assets with the least repeated context, review friction, and cost uncertainty.",
    readTime: "7 minute guide",
    sections: [
      {
        heading: "Map outputs before comparing tools",
        paragraphs: [
          "Write down the deliverables for one real campaign: hero image, paid-social variants, product video, UGC cut, voiceover, localized version, presenter clip, landing-page assets, and customer-support knowledge. Then mark which outputs share the same claims, references, and approvals.",
          "This reveals whether a specialist tool is enough or whether workflow continuity is the larger problem. A specialist can be excellent when one medium dominates. A connected studio becomes useful when the same idea must survive across many formats.",
        ],
      },
      {
        heading: "Score context, not only output quality",
        paragraphs: [
          "Quality still matters, but compare how each system handles the material around the generation. Can it remember brand rules, product facts, approved people, reference media, aspect ratios, and prior outputs? Can a teammate understand why an asset exists and which brief produced it?",
          "Look for explicit projects, reusable identities, asset history, model visibility, and approval-friendly exports. Without those pieces, the team may spend more time reconstructing context than creating.",
        ],
      },
      {
        heading: "Make costs and failures visible",
        paragraphs: [
          "A useful platform estimates cost before generation, records the charge, and returns reserved credits when a provider job fails. Test this behavior rather than assuming a credit number is predictable.",
          "Also compare the complete campaign cost. A cheap individual generation can still be expensive if the workflow requires several subscriptions, manual transfers, and repeated work.",
        ],
      },
      {
        heading: "Check the exit path",
        paragraphs: [
          "Confirm that you can download final assets, retrieve generation records, cancel billing, and understand what happens to stored work. For open-source products, verify the license, setup guide, data migrations, and provider dependencies before treating self-hosting as production-ready.",
          "OpenCreative publishes its core, API documentation, MCP integration, and self-hosting steps. It also states where provider capacity or a separate integration is still required.",
        ],
      },
    ],
    faq: [
      { question: "Should I choose one AI suite or several specialist tools?", answer: "Choose around the bottleneck. Use a specialist when one medium needs maximum depth. Use a connected suite when repeated context, asset handoffs, and fragmented billing create more work than the generation itself." },
      { question: "What should an AI marketing studio include?", answer: "At minimum, look for projects, reusable brand or product context, generation history, assets, cost visibility, permissions, and the creative operations your team actually ships." },
      { question: "Why does open-source access matter?", answer: "It provides an inspectable and extensible application layer. It does not remove hosting costs or the need to comply with third-party model terms." },
    ],
  },
};
