# Premium SaaS Upgrade Plan

This is a large scope — I'll deliver it in phases so each milestone is testable. Confirm the plan (and the few questions below) and I'll start executing phase by phase.

## Questions before I start

1. **Payments provider:** You asked for Stripe. Lovable offers a built-in seamless Stripe (no account/keys needed, handles tax/compliance). Should I use that, or do you want to bring your own Stripe account + secret key?
2. **Admin access:** Who counts as admin? I'll create a `user_roles` table with an `admin` role and let you grant it to your own user via SQL. OK?
3. **Google Sign-In:** Use Lovable Cloud's managed Google OAuth (works out of the box, no setup)? Default yes.
4. **Pricing currency:** $7.9/mo and $38.5/yr — confirm USD.

## Phase 1 — Auth & Profile
- Email/password Sign Up, Login, Forgot Password + `/reset-password` page
- Google sign-in (Lovable managed)
- `profiles` table (name, avatar, created_at) auto-created via trigger
- `user_roles` table + `has_role()` security-definer function (admin / user)
- Auth context + protected routes
- Profile page (name, email, plan badge, renewal date, billing history, upgrade/manage buttons)

## Phase 2 — Database schema
Tables (all with RLS + GRANTs):
- `profiles`
- `user_roles`
- `subscribers` (plan, status, stripe_customer_id, stripe_subscription_id, current_period_end)
- `scans` (user_id, image_url, food jsonb, totals, created_at)
- `daily_calories` (derived view or aggregated table)
- `weight_logs` (user_id, weight_kg, logged_at)
- `water_logs` (user_id, amount_ml, logged_at)

## Phase 3 — Free vs Premium gating
- Edge function `analyze-meal` checks daily scan count for free users (limit 3/day)
- History query limited to last 7 days for free
- "Upgrade" modal on limit hit
- Premium badge on profile

## Phase 4 — Stripe (built-in Lovable payments)
- Enable seamless Stripe payments
- Create Monthly ($7.9) and Yearly ($38.5) products
- Pricing page with comparison table + "Save 40%" badge
- Checkout edge function + success/cancel routes
- Webhook edge function: upgrade on `checkout.session.completed` / `customer.subscription.updated`, downgrade on `customer.subscription.deleted`
- Customer Portal link for managing/canceling
- Billing history fetched from Stripe

## Phase 5 — Premium features
- Daily calorie tracking dashboard
- Weekly + Monthly nutrition reports (charts with recharts)
- Water intake tracker (quick-add buttons)
- Weight tracker + BMI calculator (needs height in profile)
- AI diet recommendations (Lovable AI Gateway: Gemini)
- Meal history search
- Export reports → PDF (jspdf + html2canvas)
- Priority flag passed to AI function for premium users

## Phase 6 — Admin dashboard
- `/admin` route gated by `has_role('admin')`
- KPIs: total users, premium users, MRR, total revenue, daily signups, total scans, active subs
- Charts for signups & revenue trends

## Phase 7 — UI polish
- Apple-style design: refined typography, glassmorphism cards, smooth framer-motion transitions
- Dark mode toggle (persist preference)
- Mobile responsive pass
- Empty states and loading skeletons

## Technical notes
- Stack stays React + TS + Tailwind + Lovable Cloud (Supabase) + Edge Functions
- Roles stored in dedicated `user_roles` table (never on profiles) — required to prevent privilege escalation
- All Stripe secrets live in edge function env, never client
- RLS on every table; GRANTs included in same migration

Reply with answers to the 4 questions (or "go ahead with defaults") and I'll start Phase 1.