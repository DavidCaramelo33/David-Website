# Putting the website + admin panel online

## Step 1 — Create the database (Supabase), ~5 min
1. Go to supabase.com → sign in → **New project**.
   - Name: `David Portfolio` (a NEW project, separate from Lusitania HUB and Achado)
   - Region: West EU (Paris or Frankfurt)
   - Set a database password and keep it somewhere safe (you won't need to give it to Claude).
2. When it's ready: **Project Settings → API** (or "Data API"). Copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **Publishable key** (or "anon public" key). NOT the secret / service_role key.
   → Send both to Claude.

## Step 2 — Create your admin login, ~2 min
1. In Supabase: **Authentication → Users → Add user → Create new user**.
2. Enter the email you want to log in with and choose your own password. Tick "Auto confirm user".
3. **Authentication → Sign In / Providers**: turn OFF "Allow new users to sign up" (so nobody else can create an account).
→ Tell Claude which email you used (not the password).

## Step 3 — Claude finishes the connection
Claude puts your email into `supabase/schema.sql`, gives it to you to paste into **SQL Editor → New query → Run**, and fills in `config.js`.

## Step 4 — Put the site online (Netlify, free), ~3 min
1. Go to netlify.com → sign up (free).
2. **Add new site → Deploy manually** → drag the whole `D:\DavidCaramelo` folder onto the page.
3. You get a link like `david-caramelo.netlify.app`. You can rename it in Site settings, or connect your own domain later.
To update the site after Claude changes files: drag the folder again (Deploys → drag and drop).
Content you change in the admin panel (texts, projects, blog posts, photos) appears instantly, with no re-upload needed.

## Day to day
- Website: your Netlify link (or double-click `index.html` on your PC)
- Admin panel: add `/admin.html` to your link, e.g. `david-caramelo.netlify.app/admin.html`
