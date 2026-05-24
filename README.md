# ReviewPilot AI

Production-ready MVP SaaS web app for AI review and reputation management for local businesses.

## Stack

- React.js + Vite
- React Router
- Tailwind CSS
- Supabase Auth
- Supabase Postgres with RLS
- Supabase Edge Functions for server-side AI, Google, and future Stripe logic

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Create a Supabase project.

Create a new project at Supabase, then copy the project URL and anon key from Project Settings.

3. Add environment variables.

```bash
cp .env.example .env
```

Set the frontend values:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Only `VITE_` values are used by the browser. Do not put AI, Google, Stripe, or service role secrets in frontend code.

4. Run the SQL migration.

Open the Supabase SQL editor and run:

```text
supabase/migrations/20260523120000_initial_schema.sql
```

This creates:

- `profiles`
- `business_locations`
- `reviews`
- `reply_templates`

RLS is enabled on all tables, and policies restrict rows to the authenticated owner.

5. Start the app.

```bash
npm run dev
```

Open the Vite URL, sign up, add a location, then use **Load Demo Reviews** on the Reviews page. The app works locally without Google Business Profile access.

## Edge Functions

Functions live in:

```text
supabase/functions/generate-review-reply/
supabase/functions/google-oauth-start/
supabase/functions/google-oauth-callback/
supabase/functions/google-list-accounts/
supabase/functions/google-list-locations/
supabase/functions/sync-google-reviews/
supabase/functions/post-google-review-reply/
```

Deploy them with the Supabase CLI:

```bash
supabase functions deploy generate-review-reply
supabase functions deploy google-oauth-start
supabase functions deploy google-oauth-callback
supabase functions deploy google-list-accounts
supabase functions deploy google-list-locations
supabase functions deploy sync-google-reviews
supabase functions deploy post-google-review-reply
```

Set server-side secrets:

```bash
supabase secrets set AI_API_KEY=
supabase secrets set GOOGLE_CLIENT_ID=
supabase secrets set GOOGLE_CLIENT_SECRET=
supabase secrets set GOOGLE_REDIRECT_URI=
supabase secrets set APP_URL=
supabase secrets set STRIPE_SECRET_KEY=
```

`generate-review-reply` currently returns a deterministic placeholder reply and includes TODO comments for OpenAI or Gemini. Google sync and reply posting are placeholders with TODO comments for OAuth and Business Profile API integration.

## Google Business Profile Setup

Phase 2 prepares the app for real Google Business Profile access while keeping all OAuth and API calls inside Supabase Edge Functions.

1. Create a Google Cloud project.
2. Configure the OAuth consent screen.
   - App type: External unless you are using a Google Workspace internal app.
   - Add the app name, support email, privacy policy, and authorized domains.
   - Add test users while the app is in testing mode.
3. Create OAuth client credentials.
   - Application type: Web application.
   - Authorized redirect URI should match `GOOGLE_REDIRECT_URI`.
   - For local Supabase function testing this commonly looks like:

```text
http://127.0.0.1:54321/functions/v1/google-oauth-callback
```

4. Enable required Google APIs.
   - Google Business Profile APIs needed for accounts, locations, reviews, and replies.
   - OAuth scopes requested by the app include:

```text
https://www.googleapis.com/auth/business.manage
openid
email
profile
```

5. Set Supabase Edge Function secrets.

```bash
supabase secrets set GOOGLE_CLIENT_ID=your-google-client-id
supabase secrets set GOOGLE_CLIENT_SECRET=your-google-client-secret
supabase secrets set GOOGLE_REDIRECT_URI=your-google-redirect-uri
supabase secrets set APP_URL=http://localhost:5173
```

Supabase Edge Functions also use the platform-provided `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. The service role key is used only inside the OAuth callback function to store the token after Google redirects back without the browser's Supabase session header.

6. Run the Phase 2 migration.

```text
supabase/migrations/20260524090000_google_business_phase2.sql
```

7. Local testing without Google approval.
   - The Locations page can show mock Google accounts and mock Google locations.
   - The Reviews page can run a mock Google review sync.
   - The Review Detail page can run a mock Google reply post.
   - No Google tokens are stored in `localStorage`, and no Google client secret is exposed to React.

Production TODOs are marked inside the Edge Functions for token exchange, token encryption, token refresh, Google account/location fetches, review sync, and reply posting.

## Deploy Frontend to Vercel

1. Import the repository into Vercel.
2. Use the default Vite build command:

```bash
npm run build
```

3. Set Vercel environment variables:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

4. Deploy.

## Notes

- Secret-based calls must go through Supabase Edge Functions.
- The Billing page is pricing UI only. Stripe Checkout should be added through a Supabase Edge Function using `STRIPE_SECRET_KEY`.
- The Reviews page seeds 10 realistic demo reviews for the logged-in user and selected location.

## Phase 1 MVP Testing Checklist

- Sign up with email and password, then confirm you land in the protected dashboard.
- Log out, verify protected routes redirect to `/login`, then log back in.
- Create a business location from the Locations page.
- Open Reviews, select the location, and click **Load Demo Reviews**.
- Confirm demo reviews appear and are attached to the selected location.
- Use review filters: All, Unanswered, 1-2 star, and 5 star.
- Generate an AI reply; if the Edge Function is not deployed, confirm the mock fallback reply appears.
- Open a review detail page, edit the generated reply, and click **Save Reply**.
- Refresh the review detail page and confirm the saved reply remains.
- Click **Mark as Replied** and confirm the status changes to Replied.
- Open Dashboard and confirm total reviews, unanswered reviews, negative reviews, and average rating update.
- Confirm a second user cannot see the first user’s locations or reviews.
