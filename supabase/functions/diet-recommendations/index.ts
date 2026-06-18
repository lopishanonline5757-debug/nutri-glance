import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: sub } = await admin.from("subscribers").select("plan,status").eq("user_id", user.id).maybeSingle();
    const isPremium = sub && (sub.plan === "monthly" || sub.plan === "yearly") && (sub.status === "active" || sub.status === "trialing");
    if (!isPremium) return json({ error: "Premium required" }, 403);

    const { goal } = await req.json().catch(() => ({}));

    // Pull last 7 days of scans
    const since = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: scans } = await admin
      .from("scans")
      .select("meal_name,total_calories,total_protein,total_carbs,total_fat,total_fiber,created_at")
      .eq("user_id", user.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    const summary = (scans || []).slice(0, 30).map((s: any) =>
      `${new Date(s.created_at).toLocaleDateString()} — ${s.meal_name || "meal"}: ${s.total_calories}kcal P${s.total_protein} C${s.total_carbs} F${s.total_fat}`
    ).join("\n");

    const apiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a friendly registered dietitian. Give practical, evidence-based diet recommendations in concise markdown with sections: Summary, What's Working, Improvements, Tomorrow's Plan." },
          { role: "user", content: `Goal: ${goal || "general health"}\n\nMeals from past 7 days:\n${summary || "no meals logged"}` },
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return json({ error: "Rate limited" }, 429);
      if (res.status === 402) return json({ error: "AI credits exhausted" }, 402);
      return json({ error: "AI failed" }, 500);
    }
    const data = await res.json();
    return json({ recommendations: data?.choices?.[0]?.message?.content || "" });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "error" }, 500);
  }
});
