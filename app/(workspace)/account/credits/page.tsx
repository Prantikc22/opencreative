import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Coins, CreditCard, Sparkles } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { agentPricingPlans, annualTotal, creditBundles, monthlyEquivalent, pricingPlans } from "@/lib/pricing";
import { PaddleCheckoutButton } from "@/components/paddle-checkout-button";
import { paddlePriceId } from "@/lib/paddle/server";
import { ManageBillingButton } from "@/components/manage-billing-button";
export const metadata: Metadata = { title: "Credits & billing" };
export default async function Page({ searchParams }: { searchParams: Promise<{ billing?: string; checkout?: string }> }) {
  const params = await searchParams;
  const cadence = params.billing === "annual" ? "annual" : "monthly";
  const { user, supabase, workspaceId, wallet, workspace } =
    await getWorkspaceContext();
  const { data: syncedSubscription } = await supabase
    .from("subscriptions")
    .select("plan,status,cancel_at_period_end,current_period_end")
    .eq("workspace_id", workspaceId)
    .eq("provider", "paddle")
    .in("status", ["active", "trialing", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const entitlementPlan = (workspace?.product_entitlements as { creative?: string | null } | null)?.creative;
  const currentPlan = syncedSubscription?.plan || entitlementPlan || workspace?.plan || "free";
  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select(
      "id,transaction_type,status,amount,balance_after,description,created_at",
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(25);
  const checkoutConfirmed = Boolean(params.checkout === "success" && transactions?.some((transaction) => transaction.status === "settled" && transaction.amount > 0));
  return (
    <div className="billing-page">
      <header className="library-head">
        <div>
          <p className="eyebrow">
            <Coins size={13} />
            Credits
          </p>
          <h1>Make cost feel predictable.</h1>
          <p>
            Every generation shows its estimate first. Failed provider jobs
            return reserved credits automatically.
          </p>
        </div>
        <div className="wallet-card">
          <span>Available</span>
          <strong>{wallet?.balance || 0}</strong>
          <small>credits · {currentPlan} plan</small>
        </div>
      </header>
      {params.checkout === "success" && !checkoutConfirmed && <p className="checkout-success">Payment received. We’re waiting for Paddle’s signed confirmation. Your balance will update automatically.</p>}
      <nav className="billing-cadence" aria-label="Billing frequency">
        <Link className={cadence === "monthly" ? "active" : ""} href="/account/credits?billing=monthly">Monthly</Link>
        <Link className={cadence === "annual" ? "active" : ""} href="/account/credits?billing=annual">Annual · save 20%</Link>
      </nav>
      <ManageBillingButton />
      <section className="plan-grid">
        {pricingPlans.filter((plan) => !plan.custom).map((plan) => (
          <article
            className={
              String(currentPlan).toLowerCase() === plan.id
                ? "current"
                : ""
            }
            key={plan.id}
          >
            <span>{plan.name}</span>
            <div className="plan-price compact">
              <h2>${cadence === "annual" ? monthlyEquivalent(plan.monthlyPrice).toFixed(2) : plan.monthlyPrice}</h2>
              <span>per month</span>
            </div>
            {cadence === "annual" && plan.monthlyPrice > 0 && <small>${annualTotal(plan.monthlyPrice).toFixed(2)} billed yearly</small>}
            <strong>
              <Sparkles size={14} />
              {plan.credits.toLocaleString()} credits
            </strong>
            <ul>
              {plan.features.slice(0, 3).map((feature) => (
                <li key={feature}>
                  <Check size={14} />
                  {feature}
                </li>
              ))}
            </ul>
            {plan.id === currentPlan ? (
              <span className="plan-state">Current plan</span>
            ) : plan.monthlyPrice > 0 ? (
              <PaddleCheckoutButton priceId={paddlePriceId(plan.id, cadence)} label={`Choose ${plan.name}`} workspaceId={workspaceId} userId={user.id} purchaseType="subscription" itemId={plan.id} />
            ) : (
              <Link className="plan-state plan-action" href={`/pricing#${plan.id}`}>
                View plan <ArrowRight size={14} />
              </Link>
            )}
          </article>
        ))}
      </section>
      <section className="agent-billing-section">
        <div className="section-head"><div><p className="eyebrow">Customer agents</p><h2>Voice and text agents are built in.</h2></div><p>Choose the capacity you need inside the same OpenCreative account, workspace, support inbox, and billing history.</p></div>
        <div className="bundle-grid agent-billing-grid">
          {agentPricingPlans.filter((plan) => plan.monthlyPrice > 0 && !plan.custom).map((plan) => (
            <article className={plan.featured ? "featured" : ""} key={plan.id}>
              {plan.featured && <em>Best for teams</em>}
              <span>{plan.name}</span>
              <strong>${cadence === "annual" ? monthlyEquivalent(plan.monthlyPrice).toFixed(2) : plan.monthlyPrice}<small>/mo</small></strong>
              <p>{plan.includedMinutes.toLocaleString()} included agent minutes · {plan.agents} agents</p>
              <PaddleCheckoutButton priceId={paddlePriceId(plan.id, cadence)} label={`Add ${plan.name}`} workspaceId={workspaceId} userId={user.id} purchaseType="subscription" itemId={plan.id} />
            </article>
          ))}
        </div>
      </section>
      <section className="bundle-section">
        <div className="section-head">
          <div>
            <p className="eyebrow"><CreditCard size={14} /> One-time top-ups</p>
            <h2>Keep creating without changing plan.</h2>
          </div>
          <p>Top-up credits are added to your existing balance and do not expire.</p>
        </div>
        <div className="bundle-grid">
          {creditBundles.map((bundle) => (
            <article className={bundle.featured ? "featured" : ""} key={bundle.credits}>
              {bundle.featured && <em>Best value</em>}
              <span>{bundle.credits.toLocaleString()} credits</span>
              <strong>${bundle.price}</strong>
              <p>{bundle.description}</p>
              <PaddleCheckoutButton priceId={paddlePriceId(`credits-${bundle.credits}`, "one-time")} label={`Buy ${bundle.credits.toLocaleString()} credits`} workspaceId={workspaceId} userId={user.id} purchaseType="credit_topup" itemId={`credits-${bundle.credits}`} />
            </article>
          ))}
        </div>
        <p className="payment-note"><CreditCard size={16} /> Secure checkout is handled by Paddle. Credits are added only after signed payment confirmation.</p>
      </section>
      <section className="ledger-section">
        <div className="section-head">
          <h2>Credit ledger</h2>
          <span>Immutable transaction history</span>
        </div>
        <div className="ledger-table">
          {transactions?.map((tx) => (
            <div key={tx.id}>
              <span
                className={`ledger-icon ${tx.amount > 0 ? "positive" : "negative"}`}
              >
                <Coins size={14} />
              </span>
              <span>
                <strong>{tx.description}</strong>
                <small>
                  {tx.transaction_type} · {tx.status} ·{" "}
                  {new Date(tx.created_at).toLocaleString()}
                </small>
              </span>
              <strong className={tx.amount > 0 ? "positive" : "negative"}>
                {tx.amount > 0 ? "+" : ""}
                {tx.amount}
              </strong>
              <small>{tx.balance_after} balance</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
