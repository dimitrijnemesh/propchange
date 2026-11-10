# PropChange — landing page with waitlist

One-page site in **13 languages** (English, Ukrainian, Spanish, Portuguese, French, German, Italian, Polish, Turkish, Chinese, Japanese, Korean, Hindi — no Russian) with a **waitlist**, a **feedback form** and a button to the **prototype**. Everything is saved to one **Google Sheet**.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3300
```

Without step 2 below the form shows an error, because there is nowhere to save emails yet.

## Connect the Google Sheet (about 5 minutes)

1. **Create a sheet.** Go to sheets.google.com → new blank sheet → name it "PropChange waitlist".
2. **Add the script.**
   - In the sheet: **Extensions → Apps Script**.
   - Delete everything in `Code.gs` and paste the contents of `google-apps-script.js` from this folder.
   - On the first line, change `SECRET` to a long random string (for example 30+ random letters and numbers). Keep it — you need it in step 4.
   - Click **Save**.
3. **Publish it as a web app.**
   - **Deploy → New deployment** → type **Web app**.
   - Execute as: **Me**. Who has access: **Anyone**.
   - Click **Deploy**, allow the permissions, and copy the **Web app URL** (ends with `/exec`).
4. **Add the settings to the site.**
   - Copy `.env.example` to `.env.local` and fill in:
     - `GOOGLE_SCRIPT_URL` = the Web app URL from step 3
     - `WAITLIST_SECRET` = the same string you put in `SECRET`
   - Restart `npm run dev` and submit a test email and a test feedback. Two tabs appear in the sheet: **Waitlist** and **Feedback**.

**Waitlist** columns: date, email, role (follower / trader / community), language, X username (optional), phone (optional), form (hero / footer), referrer. Duplicate emails are not added twice.

**Feedback** columns: date, rating 1–5, what they liked, what to improve, email (optional), language, referrer.

> If you change the script later, use **Deploy → Manage deployments → Edit → New version**, otherwise the old code keeps running.

## Deploy to Vercel

1. Import this folder (`DEV/landing`) as a new Vercel project (framework: Next.js, auto-detected).
2. In **Project → Settings → Environment Variables** add `GOOGLE_SCRIPT_URL` and `WAITLIST_SECRET` (same values as `.env.local`). Optional: `NEXT_PUBLIC_SITE_URL` = your domain, `NEXT_PUBLIC_PROTOTYPE_URL` = link for the "Try prototype" buttons (default `https://propchange.vercel.app`).
3. Deploy. Test the form once on the live site.

If you deploy by dragging the folder, do not include `node_modules`, `.next` or `.env.local`; add the variables in the Vercel dashboard instead.

## What's on the page

Header (language menu, "Try prototype", "Join waitlist") · hero with the waitlist form (email + role, optional X and phone) and the concept diagram · problem · how it works · why Seats · win-win · **try the prototype** (screenshot + "Open the prototype" / "Give feedback") · "Seat Market on Solana — coming next" · **feedback form** · FAQ · final waitlist form · footer.

The language is picked automatically from the browser (falls back to English) and remembered.

Text: English in `lib/copy.ts`, other languages in `lib/i18n/*.ts`. Styles in `app/globals.css`. Prototype screenshot: `public/prototype.jpg`.

## Email checks and spam protection

**Email**
- Format checked in the browser and on the server.
- **Typo hint** in the form: `gmial.com` → "Did you mean sam@gmail.com?" (one click to fix).
- **Real domain:** the server checks the domain can receive mail (MX / address records). Fake or mistyped domains are rejected. If DNS is slow, the signup is allowed rather than blocked.
- **Throwaway emails** (mailinator, 10minutemail, yopmail, temp-mail…) are rejected.
- Duplicates are not added twice.

**Spam**
- **Honeypot:** a hidden field only bots fill — those submissions are silently ignored.
- **Time trap:** forms submitted less than 1.5 s after they appeared are rejected (bots are instant).
- **Origin check:** only requests from your own site are accepted (add other domains in `ALLOWED_ORIGINS` if needed).
- **Rate limit:** 5 waitlist / 3 feedback submissions per minute per IP (per server instance).
- **Secret key:** the Google Apps Script only accepts requests that carry `WAITLIST_SECRET`.

**Optional: Cloudflare Turnstile** (free, usually invisible "are you human" check — strongest protection)
1. Create a free account at dash.cloudflare.com → **Turnstile** → **Add widget**.
2. Domain: your landing domain (and `localhost` for testing). Widget mode: **Managed**.
3. Copy the **Site key** to `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and the **Secret key** to `TURNSTILE_SECRET_KEY` (in `.env.local` and in Vercel).
4. Redeploy. The check turns on automatically; with the keys empty it stays off.
