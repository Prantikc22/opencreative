import { NextResponse } from "next/server";
import { z } from "zod";
import { billingAppUrl, dodoPurchase, getDodoPayments } from "@/lib/dodo/server";
import { getWorkspaceContext } from "@/lib/workspace";

export const runtime = "nodejs";
export const maxDuration = 15;

const checkoutSchema = z.object({
  itemId: z.string().min(1).max(80),
  cadence: z.enum(["monthly", "annual", "one-time"]),
});

export async function POST(request: Request) {
  try {
    const input = checkoutSchema.parse(await request.json());
    const purchase = dodoPurchase(input.itemId, input.cadence);
    if (!purchase) return NextResponse.json({ error: "This billing item is not configured." }, { status: 400 });

    const { user, supabase, workspaceId, profile } = await getWorkspaceContext();
    const { data: knownCustomer } = await supabase
      .from("billing_customers")
      .select("provider_customer_id")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .eq("provider", "dodo")
      .maybeSingle();
    const email = user.email;
    if (!email) return NextResponse.json({ error: "Your account needs an email address before checkout." }, { status: 400 });

    const baseUrl = billingAppUrl();
    const session = await getDodoPayments().checkoutSessions.create({
      product_cart: [{ product_id: purchase.productId, quantity: 1 }],
      customer: knownCustomer?.provider_customer_id
        ? { customer_id: knownCustomer.provider_customer_id }
        : { email, name: profile?.full_name || email.split("@")[0] },
      return_url: `${baseUrl}/account/credits?checkout=success`,
      cancel_url: `${baseUrl}/account/credits?checkout=cancelled`,
      metadata: {
        workspace_id: workspaceId,
        user_id: user.id,
        purchase_type: purchase.purchaseType,
        item_id: purchase.itemId,
        cadence: purchase.cadence,
        family: purchase.family,
      },
      customization: { theme: "light", show_order_details: true },
      feature_flags: {
        allow_discount_code: true,
        allow_currency_selection: true,
        allow_phone_number_collection: false,
        redirect_immediately: true,
        single_page: true,
      },
    });

    if (!session.checkout_url) throw new Error("Dodo Payments did not return a checkout URL.");
    return NextResponse.json({ checkoutUrl: session.checkout_url });
  } catch (cause) {
    if (cause instanceof z.ZodError) return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
    console.error("Dodo checkout error", cause);
    return NextResponse.json({ error: "Secure checkout is unavailable right now." }, { status: 500 });
  }
}
