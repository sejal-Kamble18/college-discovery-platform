# EduDiscover

EduDiscover is an India-wide college discovery and admission-planning SaaS built with Next.js, Firebase and Stripe.

## Quick start

```bash
git clone https://github.com/sejal-Kamble18/college-discovery-platform.git
cd college-discovery-platform
npm ci
cp .env.example .env.local
npm run dev
```

PowerShell:

```powershell
git clone https://github.com/sejal-Kamble18/college-discovery-platform.git
Set-Location college-discovery-platform
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## What is included

- Search by institution name or state/UT
- Cursor-paginated Firestore directory plus Wikipedia discovery fallback
- Curated college profiles, comparison and private saved lists
- Firebase email/password and Google authentication
- Deterministic cutoff predictor with Likely, Possible and Reach bands
- Pro-only advanced predictor filters, saved scenarios and CSV exports
- Stripe Checkout, signed webhooks and customer billing portal
- Image-free cards and profiles, so third-party image failures cannot break the UI
- No generated “10,000 college” dataset

> The predictor is a planning tool, not an admission guarantee. Results change by course, category, quota, counselling round, year and seat availability.

## Why the website initially shows only a few profiles

The repository contains 19 reference profiles so the app works locally. Nationwide coverage comes from importing an official directory into Firestore.

Use the official [AISHE institution directory](https://dashboard.aishe.gov.in/) or [AISHE report exports](https://aishe.gov.in/). AISHE is the broad discovery dataset; it does not automatically prove recognition or provide current course fees and cutoffs.

The app uses three separate collections:

| Collection | Purpose |
| --- | --- |
| `collegeDirectory` | India-wide institution names, state/UT, location and source |
| `colleges` | Reviewed decision profiles with courses, fees and rankings |
| `cutoffRecords` | Source-versioned exam/category/course/quota/round/year cutoffs |

Wikipedia and optional Google Places results are shown live but are not silently promoted to verified decision data.

## Firebase setup

Create a Firebase Web app and place its values in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Then:

1. Enable Email/Password and Google in **Authentication → Sign-in method**.
2. Add `localhost`, staging and production hostnames to **Authorized domains**.
3. Create Cloud Firestore.
4. Add server Admin SDK credentials for billing APIs:

```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Deploy the rules and indexes:

```bash
npx firebase-tools login
npx firebase-tools use --add
npm run firebase:deploy
```

## Import the India-wide directory

Normalize the official AISHE export to UTF-8 CSV or JSON. Recommended columns:

```csv
aisheCode,name,state,district,city,type,management,website,sourceUrl,sourceAuthority,sourceYear
```

Bash:

```bash
DIRECTORY_DATA_PATH=./data/aishe-directory.csv \
DIRECTORY_SOURCE_URL=https://dashboard.aishe.gov.in/ \
DIRECTORY_SOURCE_AUTHORITY=AISHE \
DIRECTORY_SOURCE_YEAR=2024 \
CONFIRM_DIRECTORY_IMPORT=verified \
npm run import:directory
```

PowerShell:

```powershell
$env:DIRECTORY_DATA_PATH=".\data\aishe-directory.csv"
$env:DIRECTORY_SOURCE_URL="https://dashboard.aishe.gov.in/"
$env:DIRECTORY_SOURCE_AUTHORITY="AISHE"
$env:DIRECTORY_SOURCE_YEAR="2024"
$env:CONFIRM_DIRECTORY_IMPORT="verified"
npm run import:directory
```

The import runs in batches, validates states and source fields, rejects duplicate IDs and creates prefix search tokens. Keep `serviceAccountKey.json` outside Git.

## Import verified cutoffs

Prepare a JSON array containing one record per exam, category, course, quota, round and year. Each row must include `sourceAuthority`, `sourceUrl`, `datasetVersion` and `isVerified: true`.

```bash
CUTOFF_DATA_PATH=./data/cutoff-records.json \
CONFIRM_CUTOFF_IMPORT=verified \
npm run import:cutoffs
```

The bundled reference cutoffs remain clearly labelled until official records are imported.

## Stripe subscription setup

1. Create a recurring Pro product and Price in Stripe.
2. Configure the Stripe Customer Portal.
3. Add a webhook endpoint: `https://your-domain.com/api/billing/webhook`.
4. Subscribe it to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Add these variables:

```env
APP_URL=https://your-domain.com
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_API_VERSION=
NEXT_PUBLIC_PRO_PRICE_LABEL="Your displayed price"
```

Use Stripe test mode first. Checkout is hosted by Stripe; the app never receives card numbers. Webhooks are signature-checked, replay-limited and recorded idempotently before premium access changes. Users manage cancellation and payment methods through the Stripe portal.

## Optional Google Places enrichment

Google Places can add public addresses, ratings, phone numbers and websites, but Google may require billing. Leave it empty to use Firestore plus Wikipedia discovery.

```env
GOOGLE_PLACES_API_KEY=
```

Keep this key server-only and restrict it to Places API with quotas.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Or:

```bash
npm run check
```

## Deployment checklist

1. Add Firebase, Firebase Admin, Stripe and `APP_URL` variables to the hosting environment.
2. Deploy Firestore rules and indexes.
3. Import the audited AISHE directory and official cutoff records.
4. Add the deployed hostname to Firebase Authorized domains.
5. Configure the Stripe webhook and Customer Portal.
6. Test Google login, search pagination, save/compare, free predictor, Pro checkout, webhook activation, CSV export and cancellation.

For high traffic, replace the in-memory API rate limiter with Redis or another distributed limiter and move typo-tolerant full-text search to a dedicated search index.

## Maintainer

Sejal Kamble — [GitHub](https://github.com/sejal-Kamble18)
