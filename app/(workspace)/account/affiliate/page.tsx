import type { Metadata } from "next";
import { BadgeDollarSign, Copy, MousePointerClick, ReceiptText, Users } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { createAffiliateAccount } from "./actions";

export const metadata: Metadata = { title: "Affiliate earnings" };

export default async function AffiliateDashboardPage() {
  const { user, supabase } = await getWorkspaceContext();
  const { data: account } = await supabase.from("affiliate_accounts").select("code,status,payout_email,click_count,conversion_count,pending_earnings,approved_earnings,paid_earnings").eq("user_id", user.id).maybeSingle();
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return <div className="affiliate-dashboard">
    <header className="library-head"><div><p className="eyebrow"><BadgeDollarSign size={13} /> Affiliate program</p><h1>Share the studio.<br />Track every reward.</h1><p>Your referral link, performance, and payout totals stay in your own workspace.</p></div></header>
    {!account ? <section className="affiliate-enrol-card">
      <div><span>START EARNING</span><h2>Create your referral link.</h2><p>Join in one step. We will create a unique link and keep clicks, conversions, and payouts together.</p></div>
      <form action={createAffiliateAccount}><label>Payout email<input name="payoutEmail" type="email" required defaultValue={user.email || ""} /></label><button type="submit">Join the affiliate program</button></form>
    </section> : <>
      <section className="affiliate-link-card"><div><span>YOUR REFERRAL LINK</span><strong>{origin}/r/{account.code}</strong><small>Status: {account.status}</small></div><Copy size={25} /></section>
      <section className="affiliate-metrics">
        <article><MousePointerClick size={20} /><span>Clicks</span><strong>{account.click_count}</strong></article>
        <article><Users size={20} /><span>Conversions</span><strong>{account.conversion_count}</strong></article>
        <article><ReceiptText size={20} /><span>Pending</span><strong>${Number(account.pending_earnings).toFixed(2)}</strong></article>
        <article><BadgeDollarSign size={20} /><span>Paid</span><strong>${Number(account.paid_earnings).toFixed(2)}</strong></article>
      </section>
      <section className="affiliate-payout-note"><h2>Payout details</h2><p>Rewards are reviewed before moving from pending to approved. Payout updates go to {account.payout_email}.</p><strong>Approved balance: ${Number(account.approved_earnings).toFixed(2)}</strong></section>
    </>}
  </div>;
}
