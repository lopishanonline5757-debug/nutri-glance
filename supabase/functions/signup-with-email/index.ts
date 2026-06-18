import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const getEnv = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is not configured`);
  return value;
};

const resendErrorMessage = async (res: Response) => {
  const text = await res.text();
  try {
    const body = JSON.parse(text);
    return body?.message || body?.error || text || `Resend failed with ${res.status}`;
  } catch {
    return text || `Resend failed with ${res.status}`;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const resendApiKey = getEnv("RESEND_API_KEY");
    const supabaseUrl = getEnv("SUPABASE_URL");
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const from = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";

    const { email, password, fullName, redirectTo } = await req.json();
    if (!email || !password) return json({ error: "Email and password are required" }, 400);
    if (password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error: linkError } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: { full_name: fullName || "" },
        redirectTo,
      },
    });

    if (linkError) {
      console.error("Supabase signup link error", linkError);
      const alreadyRegistered = /already|registered|exists/i.test(linkError.message);
      return json(
        {
          error: alreadyRegistered
            ? "This email is already registered. Try signing in or reset your password."
            : linkError.message,
        },
        alreadyRegistered ? 409 : 400
      );
    }

    const actionLink = data.properties?.action_link;
    if (!actionLink) {
      console.error("Supabase signup link missing action_link", data);
      return json({ error: "Could not create confirmation link" }, 500);
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: "Confirm your NutriGlance account",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
            <h1 style="font-size:22px;margin-bottom:12px">Confirm your NutriGlance account</h1>
            <p>Hello${fullName ? ` ${fullName}` : ""},</p>
            <p>Click the button below to confirm your email and finish creating your account.</p>
            <p>
              <a href="${actionLink}" style="display:inline-block;background:#16a34a;color:white;padding:12px 18px;border-radius:8px;text-decoration:none">
                Confirm email
              </a>
            </p>
            <p>If the button does not work, copy and paste this link into your browser:</p>
            <p style="word-break:break-all">${actionLink}</p>
          </div>
        `,
        text: `Confirm your NutriGlance account: ${actionLink}`,
      }),
    });

    if (!resendResponse.ok) {
      const message = await resendErrorMessage(resendResponse);
      console.error("Resend email error", {
        status: resendResponse.status,
        message,
        from,
        to: email,
      });
      return json({ error: message, resendStatus: resendResponse.status }, 502);
    }

    const resendData = await resendResponse.json();
    console.log("Confirmation email sent with Resend", {
      id: resendData?.id,
      from,
      to: email,
    });

    return json({ ok: true, emailId: resendData?.id });
  } catch (e) {
    console.error("signup-with-email error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown signup error" }, 500);
  }
});
