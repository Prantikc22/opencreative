"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type DeferredVideoProps = {
  className?: string;
  poster: string;
  priority?: boolean;
  sizes: string;
  src: string;
  strategy?: "interaction" | "visible";
};

export function DeferredVideo({
  className = "",
  poster,
  priority = false,
  sizes,
  src,
  strategy = "visible",
}: DeferredVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadVideo, setLoadVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (strategy === "visible") {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          setLoadVideo(true);
          observer.disconnect();
        },
        { rootMargin: "400px" },
      );

      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }

    const start = () => setLoadVideo(true);
    const events: (keyof WindowEventMap)[] = ["pointerdown", "scroll", "keydown", "touchstart"];
    events.forEach((event) => window.addEventListener(event, start, { once: true, passive: true }));
    const fallback = window.setTimeout(start, 8000);

    return () => {
      window.clearTimeout(fallback);
      events.forEach((event) => window.removeEventListener(event, start));
    };
  }, [strategy]);

  return (
    <div ref={containerRef} className={`deferred-video ${className}`.trim()}>
      <Image
        className="deferred-video-poster"
        src={poster}
        alt=""
        fill
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        sizes={sizes}
      />
      {loadVideo ? (
        <video
          className={videoReady ? "is-ready" : undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onCanPlay={() => setVideoReady(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}
