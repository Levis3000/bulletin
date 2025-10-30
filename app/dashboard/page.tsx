"use client";
import { useState, useCallback } from "react";
import { useIframeSdk } from "@whop/react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const iframeSdk = useIframeSdk();

  const handlePurchase = useCallback(async () => {
    setLoading(true);
    try {
      let checkoutConfigurationId = process.env.NEXT_PUBLIC_WHOP_CHECKOUT_CONFIGURATION_ID as string | undefined;
      if (!checkoutConfigurationId) {
        const preferV2 = !!(iframeSdk && typeof iframeSdk.inAppPurchase === "function");
        const res = await fetch(`/api/whop/create-checkout${preferV2 ? "?v=2" : ""}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: { source: "dashboard_test" } }),
        });
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const created = await res.json();
        if (created?.id && String(created.id).startsWith("chkcfg_")) {
          checkoutConfigurationId = created.id;
        } else if (created?.purchase_url) {
          if (!iframeSdk || typeof iframeSdk.openExternalUrl !== "function") {
            throw new Error("Whop iframe SDK not initialized (openExternalUrl)");
          }
          await iframeSdk.openExternalUrl({ url: created.purchase_url });
          setLoading(false);
          return;
        } else {
          throw new Error("No checkout configuration or purchase_url returned");
        }
      }

      if (!iframeSdk || typeof iframeSdk.inAppPurchase !== "function") {
        throw new Error("Whop iframe SDK not initialized");
      }
      const result = await (iframeSdk as any).inAppPurchase({ id: checkoutConfigurationId });
      alert(`Purchase complete. Receipt: ${"receipt_id" in result ? (result as any).receipt_id : "unknown"}`);
    } catch (e) {
      console.error("Dashboard purchase error", e);
      alert("Purchase failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  }, [iframeSdk]);

  return (
    <main className="min-h-screen p-8 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-zinc-600 dark:text-zinc-300">
        Test the in-app checkout from here while running inside Whop.
      </p>
      <button
        onClick={handlePurchase}
        disabled={loading}
        className="inline-flex h-10 items-center justify-center rounded-md border border-black/10 px-4 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10 w-fit"
      >
        {loading ? "Purchasing..." : "Test In-App Checkout"}
      </button>
    </main>
  );
}


