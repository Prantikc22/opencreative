export type CreativeToolCategory = "Video" | "Image" | "Audio" | "World" | "Characters";

export type CreativeTool = {
  id: string;
  name: string;
  description: string;
  category: CreativeToolCategory;
  href: string;
  status: "Ready" | "Beta";
  mode?: "image" | "video" | "avatar";
  promptPrefix?: string;
  referenceHint?: string;
};

const imageTool = (id: string, name: string, description: string, promptPrefix: string, referenceHint = "Attach the image you want to transform."): CreativeTool => ({
  id, name, description, category: "Image", href: `/studio/image?tool=${id}`, status: "Ready", mode: "image", promptPrefix, referenceHint,
});

const videoTool = (id: string, name: string, description: string, promptPrefix: string, referenceHint?: string): CreativeTool => ({
  id, name, description, category: "Video", href: `/studio/video?tool=${id}`, status: "Ready", mode: "video", promptPrefix, referenceHint,
});

export const creativeTools: CreativeTool[] = [
  videoTool("text-to-video", "Text to video", "Generate a complete shot from a written direction.", "Create a polished video shot from this direction:"),
  videoTool("frame-to-video", "Frame to video", "Animate a still while preserving its visual identity.", "Animate the attached starting frame while preserving its subject and composition:", "Attach the still frame you want to animate."),
  videoTool("smart-shot", "Smart shot", "Turn a rough idea into a composed cinematic shot.", "Act as a cinematographer. Improve this into one coherent shot with intentional blocking, lighting and camera movement:"),
  videoTool("edit-video", "Edit video", "Restage or transform a shot from visual references.", "Recreate the referenced shot with only these requested edits:", "Attach representative frames from the source video."),
  videoTool("replace-background-video", "Replace background", "Keep the subject and move the scene somewhere new.", "Preserve the referenced subject, replace only the background, and match lighting and perspective to:"),
  videoTool("relight-video", "Relight video", "Change mood and lighting without losing the scene.", "Preserve the referenced content and relight the scene as follows:"),
  videoTool("vfx", "VFX", "Add a controlled visual effect to a shot.", "Preserve the referenced scene and add this production-quality visual effect:"),
  { id: "motion-sync", name: "Motion sync", description: "Animate an authorized character from a performance direction.", category: "Video", href: "/studio/avatar?tool=motion-sync", status: "Beta", mode: "avatar", promptPrefix: "Animate the selected character with this performance and movement:" },
  { id: "lip-sync", name: "Lip-sync", description: "Create a speaking character from a script and identity.", category: "Video", href: "/studio/avatar?tool=lip-sync", status: "Ready", mode: "avatar", promptPrefix: "Deliver this script naturally with precise lip synchronization:" },
  videoTool("upscale-video", "Upscale video", "Rebuild a clean, detailed master from source frames.", "Reconstruct the referenced shot at high visual fidelity. Preserve content exactly and improve detail, edge quality and texture:"),
  videoTool("replace-character", "Replace character", "Cast an authorized character into a referenced scene.", "Preserve the scene, camera and motion, and replace the main character with the attached authorized character reference:"),
  videoTool("extend-video", "Extend video", "Continue a shot with consistent motion and style.", "Continue the referenced shot seamlessly, preserving its characters, motion, lighting and camera path. The continuation should:"),
  videoTool("add-sound-effect", "Add sound effect", "Generate a shot with synchronized environmental audio.", "Create the referenced visual direction with synchronized native sound effects and ambience. Sound direction:"),
  videoTool("restyle-video", "Restyle video", "Apply a new art direction while retaining the action.", "Preserve the referenced action and composition, but restyle the entire shot as:"),

  imageTool("create-image", "Create image", "Generate an image from a brief.", "Create a finished image from this brief:", "References are optional."),
  imageTool("image-variations", "Image variations", "Explore new versions without losing the core idea.", "Create distinct variations of the attached image. Preserve the subject and brand identity while varying:"),
  imageTool("edit-image", "Edit image", "Make a precise prompt-directed edit.", "Edit only what is requested in the attached image and preserve everything else:"),
  imageTool("expand-image", "Expand image", "Outpaint beyond the original frame.", "Expand the attached image naturally into the selected aspect ratio. Continue its lighting, perspective and texture. New surrounding content:"),
  imageTool("upscale-image", "Upscale image", "Produce a cleaner, more detailed master.", "Reconstruct the attached image at high fidelity. Preserve composition and identity while improving detail, texture and edges:"),
  imageTool("remove-background", "Remove background", "Isolate the subject on a clean studio field.", "Precisely isolate the main subject from the attached image and place it on a clean neutral background:"),
  imageTool("change-background", "Change background", "Place a subject in a new environment.", "Preserve the attached subject exactly and replace only its environment with:"),
  imageTool("multi-view", "Multi-view", "Generate consistent alternate views of a subject.", "Using the attached subject as the identity reference, create a consistent alternate view from this angle:"),
  imageTool("camera-angle", "Camera angle control", "Reframe a scene from a specified viewpoint.", "Preserve the scene and subjects from the attached image, then re-render from this camera angle and lens direction:"),
  imageTool("face-swap", "Authorized face replace", "Use an authorized identity reference in a new composition.", "Use the attached authorized identity as the face reference while preserving natural anatomy, lighting and expression. Target composition:"),

  { id: "voice-over", name: "Voice-over", description: "Generate expressive multilingual speech.", category: "Audio", href: "/studio/audio", status: "Ready" },
  { id: "dub-video", name: "Dub & translate", description: "Transcribe and translate spoken content.", category: "Audio", href: "/studio/audio?mode=dub", status: "Ready" },
  { id: "music", name: "Music", description: "Create an original soundtrack from a brief.", category: "Audio", href: "/studio/music", status: "Beta" },

  { id: "create-world", name: "Create world", description: "Design a reusable environment concept and visual language.", category: "World", href: "/studio/image?tool=create-world", status: "Beta", mode: "image", promptPrefix: "Design a coherent production world with repeatable architecture, geography, lighting rules and visual motifs:" },
  { id: "world-camera", name: "World camera pass", description: "Explore a designed environment as a cinematic shot.", category: "World", href: "/studio/video?tool=world-camera", status: "Beta", mode: "video", promptPrefix: "Create a cinematic camera pass through the referenced environment. Preserve its world design and direct the camera as follows:" },
  { id: "cast-in-scene", name: "Cast in scene", description: "Place an authorized character into a designed world.", category: "World", href: "/studio/video?tool=cast-in-scene", status: "Beta", mode: "video", promptPrefix: "Place the attached authorized character into the referenced environment, matching perspective, scale and lighting. Scene direction:" },

  { id: "create-character", name: "Create character", description: "Build a reusable, consent-safe avatar identity.", category: "Characters", href: "/identities/avatars/new", status: "Ready" },
  { id: "character-library", name: "Character library", description: "Reuse saved and licensed avatar identities.", category: "Characters", href: "/identities/avatars", status: "Ready" },
  { id: "talking-character", name: "Talking character", description: "Turn an avatar and script into presenter video.", category: "Characters", href: "/studio/avatar?tool=talking-character", status: "Ready", mode: "avatar", promptPrefix: "Deliver this script naturally to camera:" },
];

export function getCreativeTool(id: string | null | undefined) {
  return creativeTools.find((tool) => tool.id === id);
}
