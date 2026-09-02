"use client";

import { useEffect } from "react";

export function ScrollMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scroll-depth]"),
    );
    const reveals = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".scroll-rise, .quality-showcase article, .faq-section details, .trust-grid article",
      ),
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    root.classList.add("motion-ready");

    reveals.forEach((element, index) => {
      element.classList.add("motion-reveal");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10%", threshold: 0.08 },
    );
    reveals.forEach((element) => observer.observe(element));
    let frame = 0;
    const update = () => {
      frame = 0;
      if (reducedMotion.matches) return;
      const viewport = window.innerHeight;
      for (const element of elements) {
        const rect = element.getBoundingClientRect();
        const progress = Math.max(
          -1,
          Math.min(1, (rect.top + rect.height / 2 - viewport / 2) / viewport),
        );
        const depth = Number(element.dataset.scrollDepth || "1");
        const direction = Number(element.dataset.scrollDirection || "1");
        element.style.setProperty(
          "--scroll-y",
          `${(-progress * 34 * depth).toFixed(2)}px`,
        );
        element.style.setProperty(
          "--scroll-rx",
          `${(progress * 3.5 * depth).toFixed(2)}deg`,
        );
        element.style.setProperty(
          "--scroll-ry",
          `${(progress * 2.5 * depth * direction).toFixed(2)}deg`,
        );
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reducedMotion.addEventListener("change", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      root.classList.remove("motion-ready");
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", schedule);
    };
  }, []);
  return null;
}
