"use client";

import { useState } from "react";
import { CreditCard, LoaderCircle } from "lucide-react";
import { createBillingPortalSession } from "@/app/(workspace)/account/credits/actions";

export function ManageBillingButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div className="manage-billing-wrap">
    <button type="button" onClick={async () => {
      setBusy(true);
      setError("");
      try {
        const result = await createBillingPortalSession();
        if ("error" in result) setError(result.error || "Billing management is unavailable.");
        else window.location.assign(result.url);
      } catch { setError("Billing management is unavailable right now."); }
      finally { setBusy(false); }
    }} disabled={busy}>
      {busy ? <LoaderCircle className="spin" size={15} /> : <CreditCard size={15} />} Manage subscription & invoices
    </button>
    {error && <small role="alert">{error}</small>}
  </div>;
}
