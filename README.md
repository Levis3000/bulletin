This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Whop In‑App Purchase

This app includes a basic Whop in‑app purchase button on `app/page.tsx` using the `@whop-apps/iframe` SDK.

### Setup

1. Install dependencies (already added):

```bash
npm i @whop-apps/iframe
```

2. Configure server env vars for on-demand checkout configuration creation:

```bash
echo "WHOP_API_KEY=whop_live_********" >> .env.local
echo "WHOP_BUSINESS_ID=biz_********" >> .env.local
```

3. (Optional) Configure a webhook in Whop to point to your app:

- URL: `/api/whop/webhook`
- Method: POST
- Add a secret if desired and validate it in the route.

### Usage

- Start the app and click "Buy with Whop" on the homepage. The client will POST to `/api/whop/create-checkout` to create a checkout configuration, then open Whop's in‑app modal (no redirect). After completion, it shows a basic alert with the receipt id when available.

### Notes

- The webhook handler at `app/api/whop/webhook/route.ts` currently logs events. Extend it to grant access or fulfill purchases per your business logic.

### Create checkout configuration via curl (optional)

```bash
curl -X POST http://localhost:3000/api/whop/create-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "plan": { "plan_type": "one_time", "initial_price": 1000 },
    "metadata": { "sku": "demo_sku" }
  }'
```
