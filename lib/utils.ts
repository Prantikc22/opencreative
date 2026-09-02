import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanFileName(name: string) {
  return (
    name
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[.-]+|[.-]+$/g, "")
      .slice(0, 120) || "asset"
  );
}

export function absoluteUrl(path: string) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return new URL(path, origin).toString();
}

export function creatorError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("insufficient"))
      return "You need more credits for this generation.";
    if (message.includes("rate") || message.includes("429"))
      return "The creative engine is busy. Try again in a moment.";
    if (message.includes("unsupported"))
      return "That setting is not supported by the selected quality tier.";
  }
  return fallback;
}
