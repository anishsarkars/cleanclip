import { NextRequest, NextResponse } from "next/server";

const MONTHLY_PRODUCT_ID = "pdt_0NalSjZWHhamGs4oYJvTe";
const YEARLY_PRODUCT_ID = "pdt_0NalSUMsJzvscQl8QNvVM";

function getDodoBaseUrl() {
  const env = process.env.DODO_PAYMENTS_ENV || "test";
  if (env === "live") return "https://live.dodopayments.com";
  return "https://test.dodopayments.com";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as null | {
      plan?: string;
      customer?: { email?: string; name?: string };
      metadata?: Record<string, unknown>;
    };
    const plan = body?.plan;
    if (plan !== "monthly" && plan !== "yearly") {
      return NextResponse.json({ error: "INVALID_PLAN" }, { status: 400 });
    }

    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "MISSING_DODO_PAYMENTS_API_KEY" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const returnUrl = `${appUrl}/billing/success?plan=${encodeURIComponent(plan)}`;

    const product_id = plan === "monthly" ? MONTHLY_PRODUCT_ID : YEARLY_PRODUCT_ID;
    const customer = body?.customer;
    const metadata = {
      plan,
      ...(body?.metadata || {}),
    };

    const resp = await fetch(`${getDodoBaseUrl()}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        product_cart: [{ product_id, quantity: 1 }],
        customer: customer?.email || customer?.name ? customer : undefined,
        return_url: returnUrl,
        metadata,
      }),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json(
        { error: "DODO_CHECKOUT_CREATE_FAILED", details: data },
        { status: resp.status }
      );
    }

    const checkoutUrl = data?.checkout_url;
    if (!checkoutUrl || typeof checkoutUrl !== "string") {
      return NextResponse.json({ error: "MISSING_CHECKOUT_URL", details: data }, { status: 502 });
    }

    return NextResponse.json({ checkout_url: checkoutUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: "INTERNAL_ERROR", message: msg }, { status: 500 });
  }
}

