export type CreativeToolCategory = "Video" | "Image" | "Audio" | "World" | "Characters";

export type CreativeTool = {
  id: string;
  name: string;
  description: string;
  category: CreativeToolCategory;
  href: string;
  status: "Ready" | "Beta" | "Setup required";
  mode?: "image" | "video" | "avatar";
  promptPrefix?: string;
  referenceHint?: string;
  sourceVideo?: boolean;
  requiresSourceVideo?: boolean;
  requiresReferences?: boolean;
};

const imageTool = (id: string, name: string, description: string, promptPrefix: string, referenceHint = "Attach the image you want to transform."): CreativeTool => ({
  id, name, description, category: "Image", href: `/studio/image?tool=${id}`, status: "Ready", mode: "image", promptPrefix, referenceHint, requiresReferences: referenceHint !== "References are optional.",
});

const videoTool = (id: string, name: string, description: string, promptPrefix: string, referenceHint?: string, sourceVideo = false, requiresReferences = false): CreativeTool => ({
  id, name, description, category: "Video", href: `/studio/video?tool=${id}`, status: "Ready", mode: "video", promptPrefix, referenceHint, sourceVideo, requiresSourceVideo: sourceVideo, requiresReferences,
});

export const creativeTools: CreativeTool[] = [
  videoTool("text-to-video", "Text to video", "Generate a complete shot from a written direction.", "Create a polished video shot from this direction:"),
  videoTool("frame-to-video", "Frame to video", "Animate a still while preserving its visual identity.", "Animate the attached starting frame while preserving its subject and composition:", "Attach the still frame you want to animate.", false, true),
  videoTool("smart-shot", "Smart shot", "Turn a rough idea into a composed cinematic shot.", "Act as a cinematographer. Improve this into one coherent shot with intentional blocking, lighting and camera movement:"),
  videoTool("edit-video", "Edit video", "Apply prompt-directed edits to uploaded footage with Runway Aleph.", "Edit the uploaded source video. Preserve everything not explicitly changed, and apply only these edits:", "Upload the source MP4, MOV or WebM video.", true),
  videoTool("replace-background-video", "Replace video background", "Keep the foreground action and replace the environment.", "Edit the uploaded source video. Preserve the foreground subject and action, replace only the background, and match lighting and perspective to:", "Upload the source video and optionally attach environment references.", true),
  videoTool("relight-video", "Relight video", "Change the lighting treatment of uploaded footage.", "Edit the uploaded source video. Preserve its content and motion while applying this lighting treatment:", "Upload the source video.", true),
  videoTool("vfx", "Add video VFX", "Apply a controlled visual effect to uploaded footage.", "Edit the uploaded source video. Preserve its timing and subjects while adding this production-quality visual effect:", "Upload the source video.", true),
  { id: "lip-sync", name: "Lip-sync", description: "Create a speaking character from a script and identity.", category: "Video", href: "/studio/avatar?tool=lip-sync", status: "Ready", mode: "avatar", promptPrefix: "Deliver this script naturally with precise lip synchronization:" },
  videoTool("upscale-video", "Upscale video", "Upscale uploaded footage with FLUX Video Upscale.", "Upscale the uploaded source video while preserving its content. Optional creative detail guidance:", "Upload the source MP4, MOV or WebM video.", true),
  videoTool("replace-character", "Replace character", "Cast an authorized character reference into uploaded footage.", "Edit the uploaded source video. Preserve the scene, camera and motion, and replace the main character with the attached authorized character reference:", "Upload the source video and attach the authorized character image.", true, true),
  videoTool("extend-video", "Extend video", "Continue uploaded footage with Seedance 2.5.", "Continue the uploaded source video seamlessly, preserving its characters, motion, lighting and camera path. The continuation should:", "Upload the source video.", true),
  videoTool("generate-with-sound", "Generate with sound", "Create a new shot with synchronized environmental audio.", "Create a new video with synchronized native sound effects and ambience. Sound direction:"),
  videoTool("restyle-video", "Restyle video", "Apply a new art direction while retaining the uploaded action.", "Edit the uploaded source video. Preserve its action and composition, but restyle the entire shot as:", "Upload the source video.", true),

  imageTool("create-image", "Create image", "Generate an image from a brief.", "Create a finished image from this brief:", "References are optional."),
  imageTool("image-variations", "Image variations", "Explore new versions without losing the core idea.", "Create distinct variations of the attached image. Preserve the subject and brand identity while varying:"),
  imageTool("edit-image", "Edit image", "Make a precise prompt-directed edit.", "Edit only what is requested in the attached image and preserve everything else:"),
  imageTool("expand-image", "Expand image", "Outpaint beyond the original frame.", "Expand the attached image naturally into the selected aspect ratio. Continue its lighting, perspective and texture. New surrounding content:"),
  imageTool("enhance-image", "Enhance image", "Create a cleaner, more detailed version of a reference image.", "Reconstruct the attached image at high fidelity. Preserve composition and identity while improving detail, texture and edges:"),
  imageTool("remove-background", "Remove background", "Isolate the subject on a transparent canvas.", "Precisely isolate the main subject from the attached image and remove the entire background. Return a transparent PNG:"),
  imageTool("change-background", "Change background", "Place a subject in a new environment.", "Preserve the attached subject exactly and replace only its environment with:"),
  imageTool("multi-view", "Multi-view", "Generate consistent alternate views of a subject.", "Using the attached subject as the identity reference, create a consistent alternate view from this angle:"),
  imageTool("camera-angle", "Camera angle control", "Reframe a scene from a specified viewpoint.", "Preserve the scene and subjects from the attached image, then re-render from this camera angle and lens direction:"),
  imageTool("identity-portrait", "Identity-guided portrait", "Create a new portrait from an authorized identity reference.", "Use the attached authorized identity as the face reference while preserving natural anatomy, lighting and expression. Target composition:"),

  { id: "voice-over", name: "Voice-over", description: "Generate expressive multilingual speech.", category: "Audio", href: "/studio/audio", status: "Ready" },
  { id: "dub-video", name: "Dub & translate", description: "Transcribe and translate spoken content.", category: "Audio", href: "/studio/audio?mode=dub", status: "Ready" },
  { id: "music", name: "Music", description: "Enable Google Lyria billing or OpenRouter shared capacity to generate music.", category: "Audio", href: "/studio/music", status: "Setup required" },

  { id: "create-world", name: "World concept", description: "Generate a reusable environment concept and visual language.", category: "World", href: "/studio/image?tool=create-world", status: "Ready", mode: "image", promptPrefix: "Design a coherent production-world concept with repeatable architecture, geography, lighting rules and visual motifs:" },
  { id: "world-camera", name: "World camera shot", description: "Generate a cinematic shot from environment references.", category: "World", href: "/studio/video?tool=world-camera", status: "Ready", mode: "video", promptPrefix: "Create a cinematic camera shot through the referenced environment. Preserve its world design and direct the camera as follows:", referenceHint: "Attach one or more environment concept images.", requiresReferences: true },
  { id: "cast-in-scene", name: "Cast in scene", description: "Place an authorized character into a referenced environment.", category: "World", href: "/studio/video?tool=cast-in-scene", status: "Ready", mode: "video", promptPrefix: "Place the attached authorized character into the referenced environment, matching perspective, scale and lighting. Scene direction:", referenceHint: "Attach the authorized character and environment images.", requiresReferences: true },

  { id: "create-character", name: "Create character", description: "Build a reusable, consent-safe avatar identity.", category: "Characters", href: "/identities/avatars/new", status: "Ready" },
  { id: "character-library", name: "Character library", description: "Reuse saved and licensed avatar identities.", category: "Characters", href: "/identities/avatars", status: "Ready" },
  { id: "talking-character", name: "Talking character", description: "Turn an avatar and script into presenter video.", category: "Characters", href: "/studio/avatar?tool=talking-character", status: "Ready", mode: "avatar", promptPrefix: "Deliver this script naturally to camera:" },
];

export function getCreativeTool(id: string | null | undefined) {
  return creativeTools.find((tool) => tool.id === id);
}
