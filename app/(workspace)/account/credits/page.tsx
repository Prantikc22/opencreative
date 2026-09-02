import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Coins, CreditCard, Sparkles } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { creditBundles, pricingPlans } from "@/lib/pricing";
import { productConfig } from "@/lib/config";
export const metadata: Metadata = { title: "Credits & billing" };
export default async function Page() {
  const { supabase, workspaceId, wallet, workspace } =
    await getWorkspaceContext();
  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select(
      "id,transaction_type,status,amount,balance_after,description,created_at",
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(25);
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
          <small>credits · {workspace?.plan || "free"} plan</small>
        </div>
      </header>
      <section className="plan-grid">
        {pricingPlans.map((plan) => (
          <article
            className={
              String(workspace?.plan).toLowerCase() === plan.id
                ? "current"
                : ""
            }
            key={plan.id}
          >
            <span>{plan.name}</span>
            <div className="plan-price compact">
              <h2>${plan.monthlyPrice}</h2>
              <span>per month</span>
            </div>
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
            {plan.id === (workspace?.plan || "free") ? (
              <span className="plan-state">Current plan</span>
            ) : (
              <Link className="plan-state plan-action" href={`/pricing#${plan.id}`}>
                View plan <ArrowRight size={14} />
              </Link>
            )}
          </article>
        ))}
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
              <a
                href={`mailto:${productConfig.supportEmail}?subject=${encodeURIComponent(`OpenCreative ${bundle.credits} credit top-up`)}&body=${encodeURIComponent(`Please help me add the ${bundle.credits}-credit bundle to workspace ${workspaceId}.`)}`}
              >
                Request this bundle <ArrowRight size={15} />
              </a>
            </article>
          ))}
        </div>
        <p className="payment-note">
          <CreditCard size={16} /> Secure self-serve card checkout is awaiting a
          payment-provider connection. Bundle requests open a pre-filled billing
          email; credits are never granted before payment is verified.
        </p>
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
