import { NextRequest, NextResponse } from "next/server";

// Basic webhook receiver for Whop pay-in events.
// You should validate signatures if configured in Whop dashboard.
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    // Signature header name subject to your Whop webhook setup
    const signature = req.headers.get("whop-signature") || req.headers.get("Whop-Signature");

    // TODO: Validate signature using WHOP_WEBHOOK_SECRET if provided
    // Leaving as a no-op to keep the scaffold minimal and non-blocking
    if (!rawBody) {
      return NextResponse.json({ ok: false, error: "Empty body" }, { status: 400 });
    }

    // Attempt to parse JSON; ignore if not JSON
    let json: unknown = undefined;
    try {
      json = JSON.parse(rawBody);
    } catch {
      // ignore non-JSON bodies
    }

    // For now, just log the event. Replace with your business logic (grant access, etc.).
    console.log("[Whop Webhook] signature=", signature);
    console.log("[Whop Webhook] body=", json ?? rawBody);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Whop Webhook] handler error", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}


