import { NextRequest, NextResponse } from "next/server";

// Creates a Whop Checkout Configuration via Whop API.
// Requires env: WHOP_API_KEY and WHOP_BUSINESS_ID (biz_XXXX).
// Accepts JSON body and forwards it to Whop API (v1) with sensible defaults.

type CreateCheckoutBody = {
  plan?: {
    company_id?: string;
    initial_price?: number;
    plan_type?: "one_time" | "subscription";
    interval?: "day" | "week" | "month" | "year";
  };
  metadata?: Record<string, unknown>;
};

export async function POST(req: NextRequest) {
  // Allow caller to provide Authorization header; otherwise fall back to env key
  const incomingAuth = req.headers.get("authorization") || req.headers.get("Authorization");
  const apiKey = incomingAuth?.toLowerCase().startsWith("bearer ")
    ? incomingAuth.slice(7).trim()
    : process.env.WHOP_API_KEY;
  const defaultBusinessId = process.env.WHOP_BUSINESS_ID; // e.g. biz_XXXX

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing WHOP_API_KEY env var" },
      { status: 500 }
    );
  }

  try {
    const body = (await req.json().catch(() => ({}))) as any;

    // Default company id if not provided in body
    const company_id = body?.plan?.company_id ?? defaultBusinessId;
    if (!company_id) {
      return NextResponse.json(
        { error: "Provide WHOP_BUSINESS_ID or include plan.company_id in body" },
        { status: 400 }
      );
    }

    // Forward body as-is and only ensure required fields exist / have defaults
    const payload = {
      ...body,
      plan: {
        ...body?.plan,
        company_id,
        currency: body?.plan?.currency ?? "usd",
        renewal_price: 101,
        initial_price: 2000,
        billing_period: 30,


      },
    };

    // Use v1 since your curl succeeded against v1
    const res = await fetch("https://api.whop.com/api/v1/checkout_configurations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to create checkout configuration", details: json },
        { status: res.status }
      );
    }

    return NextResponse.json(json);
  } catch (error) {
    console.error("[Whop create-checkout] error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


