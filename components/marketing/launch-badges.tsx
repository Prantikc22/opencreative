/* eslint-disable @next/next/no-img-element -- vendor badges must use their exact embed assets */

const launchBadges = [
  {
    href: "https://smollaunch.com",
    src: "https://smollaunch.com/badges/featured.svg",
    alt: "OpenCreative — Featured on Smol Launch",
    width: 250,
    height: 60,
  },
  {
    href: "https://www.uneed.best/tool/opencreative",
    src: "https://www.uneed.best/EMBED3.png",
    alt: "Launching Soon on Uneed",
    width: 250,
    height: 65,
  },
  {
    href: "https://fazier.com",
    src: "https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=featured&theme=neutral",
    alt: "OpenCreative featured on Fazier",
    width: 250,
    height: 59,
  },
] as const;

export function LaunchBadges({ placement }: { placement: "hero" | "footer" }) {
  return (
    <div className={`launch-badges launch-badges-${placement}`} aria-label="OpenCreative launch features">
      {launchBadges.map((badge) => (
        <a href={badge.href} target="_blank" rel="noopener" key={badge.href}>
          <img
            src={badge.src}
            alt={badge.alt}
            loading="lazy"
            width={badge.width}
            height={badge.height}
          />
        </a>
      ))}
    </div>
  );
}
