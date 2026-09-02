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
  const [videoSeconds, setVideoSeconds] = useState(60);
  const [voiceMinutes, setVoiceMinutes] = useState(10);
  const [avatarClips, setAvatarClips] = useState(2);

  const estimatedCredits = useMemo(
    () =>
      images * 2 +
      Math.ceil(videoSeconds / 5) * 6 +
      voiceMinutes * 2 +
      avatarClips * 20,
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
          Move the sliders. We estimate a practical monthly credit budget and
          recommend the smallest plan that fits it.
        </p>
      </header>
      <div className="calculator-shell">
        <div className="calculator-controls">
          <SliderRow
            label="Generated images"
            detail="Concepts, product shots and campaign stills"
            value={images}
            min={0}
            max={200}
            step={5}
            suffix="images"
            onChange={setImages}
          />
          <SliderRow
            label="Generated video"
            detail="Individual shots or assembled campaign footage"
            value={videoSeconds}
            min={0}
            max={600}
            step={10}
            suffix="seconds"
            onChange={setVideoSeconds}
          />
          <SliderRow
            label="Voice generation"
            detail="Narration, UGC reads and multilingual dialogue"
            value={voiceMinutes}
            min={0}
            max={180}
            step={5}
            suffix="minutes"
            onChange={setVoiceMinutes}
          />
          <SliderRow
            label="Avatar clips"
            detail="Authorized talking-avatar scenes"
            value={avatarClips}
            min={0}
            max={30}
            step={1}
            suffix="clips"
            onChange={setAvatarClips}
          />
          <small className="calculator-disclaimer">
            Estimate only. The exact credit cost is always shown before each
            generation and varies by model, duration and quality.
          </small>
        </div>
        <aside className="calculator-result" aria-live="polite">
          <span>Recommended plan</span>
          <strong>{recommendation.name}</strong>
          <div>
            <b>${recommendation.monthlyPrice}</b>
            <small>per month</small>
          </div>
          <p>
            <Sparkles size={17} /> About {estimatedCredits.toLocaleString()} credits
            for this monthly mix.
          </p>
          <ul>
            <li><Check size={16} /> {recommendation.credits.toLocaleString()} included credits</li>
            <li><Check size={16} /> Costs visible before generation</li>
            <li><Check size={16} /> Failed requests return reserved credits</li>
          </ul>
          <Link href={`/signup?plan=${recommendation.id}`}>
            Choose {recommendation.name} <ArrowRight size={17} />
          </Link>
        </aside>
      </div>
    </section>
  );
}
