"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function DodoCheckoutReconciler({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch("/api/billing/dodo/reconcile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subscriptionId }),
    }).then(async (response) => {
      if (!active) return;
      if (!response.ok) {
        setFailed(true);
        return;
      }
      router.replace("/account/credits?checkout=success", { scroll: false });
      router.refresh();
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [router, subscriptionId]);

  return (
    <p className="checkout-success" role="status">
      {failed
        ? "Payment succeeded, but the plan status is still syncing. Refresh shortly or contact support if it does not update."
        : "Payment succeeded. Confirming your plan with Dodo Payments…"}
    </p>
  );
}
