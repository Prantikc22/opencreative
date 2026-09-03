"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Calculator, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { pricingPlans } from "@/lib/pricing";

type SliderRowProps = {
  label: string;
  detail: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
};

function SliderRow({
  label,
  detail,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: SliderRowProps) {
  return (
    <label className="calculator-row">
      <span>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
      <output>
        {value} {suffix}
      </output>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function PricingCalculator() {
  const [images, setImages] = useState(20);
  const [videoSeconds, setVideoSeconds] = useState(20);
  const [voiceMinutes, setVoiceMinutes] = useState(10);
  const [avatarClips, setAvatarClips] = useState(1);

  const estimatedCredits = useMemo(
    () =>
      images * 12 +
      Math.ceil(videoSeconds / 5) * 200 +
      voiceMinutes * 4 +
      avatarClips * 105,
    [avatarClips, images, videoSeconds, voiceMinutes],
  );

  const recommendation =
    pricingPlans.find((plan) => estimatedCredits <= plan.credits) ??
    pricingPlans[pricingPlans.length - 1];

  return (
    <section className="pricing-calculator" id="calculator">
      <header>
        <p className="eyebrow">
          <Calculator size={15} /> Usage calculator
        </p>
        <h2>Price the work you actually make.</h2>
        <p>
          Move the sliders. This estimate uses the standard 720p video route,
          standard images, voice and five-second avatar clips.
        </p>
      </header>
      <div className="calculator-shell">
        <div className="calculator-controls">
          <SliderRow
            label="Generated images"
            detail="Concepts, product shots and campaign stills"
            value={images}
            min={0}
            max={600}
            step={5}
            suffix="images"
            onChange={setImages}
          />
          <SliderRow
            label="Generated video"
            detail="Individual shots or assembled campaign footage"
            value={videoSeconds}
            min={0}
            max={1800}
            step={10}
            suffix="seconds"
            onChange={setVideoSeconds}
          />
          <SliderRow
            label="Voice generation"
            detail="Narration, UGC reads and multilingual dialogue"
            value={voiceMinutes}
            min={0}
            max={600}
            step={5}
            suffix="minutes"
            onChange={setVoiceMinutes}
          />
          <SliderRow
            label="Avatar clips"
            detail="Authorized talking-avatar scenes"
            value={avatarClips}
            min={0}
            max={100}
            step={1}
            suffix="clips"
            onChange={setAvatarClips}
          />
          <small className="calculator-disclaimer">
            Premium models use more credits. The exact cost is always shown
            before generation and failed jobs return the reserved credits.
          </small>
        </div>
        <aside className="calculator-result" aria-live="polite">
          <span>Recommended plan</span>
          <strong>{recommendation.name}</strong>
          <div>
            <b>{recommendation.custom ? "Custom" : `$${recommendation.monthlyPrice}`}</b>
            <small>{recommendation.custom ? "quote" : "per month"}</small>
          </div>
          <p>
            <Sparkles size={17} /> About {estimatedCredits.toLocaleString()} credits
            for this monthly mix.
          </p>
          <ul>
            <li><Check size={16} /> {recommendation.custom ? "Credits sized to your usage" : `${recommendation.credits.toLocaleString()} included credits`}</li>
            <li><Check size={16} /> Costs visible before generation</li>
            <li><Check size={16} /> Failed requests return reserved credits</li>
          </ul>
          <Link href={`/signup?product=creative&plan=${recommendation.id}`}>
            {recommendation.custom ? "Request a quote" : `Choose ${recommendation.name}`} <ArrowRight size={17} />
          </Link>
        </aside>
      </div>
    </section>
  );
}
