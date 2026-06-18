# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b747693d-f35a-46b5-992f-0c97d834dacf

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b747693d-f35a-46b5-992f-0c97d834dacf) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b747693d-f35a-46b5-992f-0c97d834dacf) and click on Share -> Publish.

## Auth and email setup

Email signup sends confirmation mail from the Supabase Edge Function `signup-with-email`. The frontend only calls the function and shows success after Resend accepts the email.

Set these Supabase function secrets:

```sh
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set RESEND_FROM_EMAIL="NutriGlance <hello@your-verified-domain.com>"
```

Use a sender from a verified Resend domain for production. If your domain is not verified yet, use Resend's test sender only for testing.

In Supabase Auth settings:

- Enable the Google provider and add the Google client ID/secret.
- Set the Site URL to the deployed Lovable app URL.
- Add redirect URLs for the deployed app and local development:
  - `https://your-lovable-app-url/auth/callback`
  - `https://your-lovable-app-url/reset-password`
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/reset-password`

In Google Cloud OAuth settings, add the Supabase callback URL:

```text
https://jyarierrvfomrqvomdlz.supabase.co/auth/v1/callback
```

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
