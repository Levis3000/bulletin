"use client";
import { useCallback, useState } from "react";
import { useIframeSdk } from "@whop/react";
import Image from "next/image";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const iframeSdk = useIframeSdk();

  const handlePurchase = useCallback(async () => {
    setLoading(true);
    try {
      // 1) If provided, prefer an existing checkout configuration id from env
      let checkoutConfigurationId = process.env.NEXT_PUBLIC_WHOP_CHECKOUT_CONFIGURATION_ID as string | undefined;
      
      // 2) Otherwise, create a checkout configuration/session on-demand (server-side)
      if (!checkoutConfigurationId) {
        const preferV2 = !!(iframeSdk && typeof iframeSdk.inAppPurchase === "function");
        const createRes = await fetch(`/api/whop/create-checkout${preferV2 ? "?v=2" : ""}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Optional: customize price/metadata here
            metadata: { source: "in_app_demo" },
          }),
        });
        if (!createRes.ok) {
          const errText = await createRes.text();
          throw new Error(`Create checkout failed: ${errText}`);
        }
        const created = await createRes.json();
        // v2 returns chkcfg_..., v1 returns ch_... and purchase_url
        if (created?.id && String(created.id).startsWith("chkcfg_")) {
          checkoutConfigurationId = created.id;
        } else if (created?.purchase_url) {
          // Fallback: open purchase_url in-app via iframe SDK
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
      const result = await (iframeSdk as any).inAppPurchase({ id: checkoutConfigurationId , plan_id: "plan_1234567890"});
      // result may include session_id and receipt_id
      alert(`Purchase complete. Receipt: ${"receipt_id" in result ? (result as any).receipt_id : "unknown"}`);
    } catch (err) {
      console.error("Whop purchase error", err);
      alert("Purchase failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
          >
            {loading ? "Purchasing..." : "Buy with Whop"}
          </button>
        </div>
      </main>
    </div>
  );
}
