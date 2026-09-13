"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { Settings2, ShieldCheck } from "lucide-react";

const STORAGE_KEY = "opencreative-cookie-consent-v1";
const OPEN_EVENT = "opencreative:open-cookie-settings";

type Consent = { analytics: boolean; updatedAt: string };
type ClarityFunction = (...args: unknown[]) => void;

function readConsent(): Consent | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) as Consent : null;
  } catch {
    return null;
  }
}

function persistConsent(analytics: boolean) {
  const consent = { analytics, updatedAt: new Date().toISOString() } satisfies Consent;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  document.cookie = `oc_cookie_consent=${analytics ? "analytics" : "necessary"}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  window.dispatchEvent(new CustomEvent("opencreative:consent-changed", { detail: consent }));
  return consent;
}

export function CookieSettingsButton() {
  return (
    <button
      className="cookie-settings-link"
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
    >
      Cookie settings
    </button>
  );
}

export function PrivacyConsent() {
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);
  const [customizing, setCustomizing] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = readConsent();
      setConsent(stored);
      setAnalyticsChoice(Boolean(stored?.analytics));
    });
    const openSettings = () => {
      const current = readConsent();
      setConsent(null);
      setAnalyticsChoice(Boolean(current?.analytics));
      setCustomizing(true);
    };
    window.addEventListener(OPEN_EVENT, openSettings);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(OPEN_EVENT, openSettings);
    };
  }, []);

  function save(analytics: boolean) {
    const previouslyEnabled = Boolean(readConsent()?.analytics);
    if (!analytics && previouslyEnabled) {
      const clarity = (window as typeof window & { clarity?: ClarityFunction }).clarity;
      clarity?.("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
    }
    setConsent(persistConsent(analytics));
    setAnalyticsChoice(analytics);
    setCustomizing(false);
    if (!analytics && previouslyEnabled) window.location.reload();
  }

  return (
    <>
      {consent?.analytics && (
        <>
          <Script id="datafast-queue" strategy="afterInteractive">
            {`window.datafast=window.datafast||function(){window.datafast.q=window.datafast.q||[];window.datafast.q.push(arguments);};`}
          </Script>
          <Script
            id="datafast-analytics"
            defer
            data-website-id="dfid_vUB4PHjlIYWuk6iDUImtA"
            data-domain="opencreativehq.com"
            src="https://datafa.st/js/script.js"
            strategy="afterInteractive"
          />
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "yhj7g9bwtm");window.clarity("consentv2",{ad_Storage:"denied",analytics_Storage:"granted"});`}
          </Script>
        </>
      )}

      {consent === null && (
        <section className="privacy-consent" role="dialog" aria-modal="false" aria-labelledby="privacy-consent-title">
          <header>
            <span><ShieldCheck size={19} aria-hidden="true" /></span>
          </header>
          <h2 id="privacy-consent-title">We value your privacy</h2>
          <p>
            We use necessary storage to keep the site working. With your permission,
            analytics cookies help us understand site usage and improve OpenCreative.
            Read our <Link href="/privacy#cookies">privacy policy</Link>.
          </p>

          {customizing && (
            <div className="privacy-consent-options">
              <div><span><strong>Necessary</strong><small>Required for security, sessions, and your saved choice.</small></span><b>Always on</b></div>
              <label>
                <span><strong>Analytics</strong><small>DataFast and Microsoft Clarity usage analytics.</small></span>
                <input type="checkbox" checked={analyticsChoice} onChange={(event) => setAnalyticsChoice(event.target.checked)} />
              </label>
            </div>
          )}

          <footer>
            <button type="button" className="consent-secondary" onClick={() => save(false)}>Reject analytics</button>
            {customizing ? (
              <button type="button" className="consent-primary" onClick={() => save(analyticsChoice)}>Save choices</button>
            ) : (
              <>
                <button type="button" className="consent-settings" onClick={() => setCustomizing(true)} aria-label="Customize cookie settings"><Settings2 size={18} /></button>
                <button type="button" className="consent-primary" onClick={() => save(true)}>Accept analytics</button>
              </>
            )}
          </footer>
        </section>
      )}
    </>
  );
}
