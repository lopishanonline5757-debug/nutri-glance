import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const toNum = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
};

const extractJson = (text: string) => {
  const cleaned = text.replace(/```json|```/gi, "").trim();
  const start = Math.min(...[cleaned.indexOf("{"), cleaned.indexOf("[")].filter((i) => i >= 0));
  const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  if (!Number.isFinite(start) || end < 0) throw new Error("AI returned no JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
};

const analyzeWithAI = async (imageBase64: string, priority: boolean) => {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("AI not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: priority ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            'You are a nutrition image analyzer. Return ONLY JSON with shape: {"status":"success","meal_name":"short descriptive name","food":[{"name":"","quantity":"","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sugar":0}],"total":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sugar":0}}. Estimate values from the visible meal photo.',
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this meal photo. Give per-item and total calories, protein, carbs, fat, fiber, sugar." },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    console.error("AI error", res.status, t);
    if (res.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits.");
    throw new Error(`AI analysis failed (${res.status})`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  const text = Array.isArray(content) ? content.map((p: any) => p?.text || "").join("\n") : String(content || "");
  const parsed: any = extractJson(text);
  const out = Array.isArray(parsed) ? parsed[0]?.output ?? parsed[0] : parsed.output ?? parsed;
  if (!out?.food || !out?.total) throw new Error("AI returned invalid format");

  return {
    status: "success",
    meal_name: out.meal_name || "Meal",
    food: out.food.map((i: any) => ({
      name: String(i.name || "Food"),
      quantity: String(i.quantity || ""),
      calories: toNum(i.calories),
      protein: toNum(i.protein),
      carbs: toNum(i.carbs),
      fat: toNum(i.fat),
      fiber: toNum(i.fiber),
      sugar: toNum(i.sugar),
    })),
    total: {
      calories: toNum(out.total.calories),
      protein: toNum(out.total.protein),
      carbs: toNum(out.total.carbs),
      fat: toNum(out.total.fat),
      fiber: toNum(out.total.fiber),
      sugar: toNum(out.total.sugar),
    },
  };
};

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
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { imageBase64 } = await req.json();
    if (!imageBase64) return json({ error: "Image required" }, 400);

    // Check plan
    const { data: sub } = await admin.from("subscribers").select("plan,status").eq("user_id", user.id).maybeSingle();
    const isPremium = sub && (sub.plan === "monthly" || sub.plan === "yearly") && (sub.status === "active" || sub.status === "trialing");

    // Free user daily limit (3/day)
    if (!isPremium) {
      const since = new Date(); since.setHours(0, 0, 0, 0);
      const { count } = await admin
        .from("scans")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", since.toISOString());
      if ((count ?? 0) >= 3) {
        return json({ error: "Daily limit reached", limit_reached: true }, 200);
      }
    }

    const result = await analyzeWithAI(imageBase64, !!isPremium);

    // Save scan
    const { data: scan, error: scanErr } = await admin
      .from("scans")
      .insert({
        user_id: user.id,
        food: result.food,
        meal_name: result.meal_name,
        total_calories: result.total.calories,
        total_protein: result.total.protein,
        total_carbs: result.total.carbs,
        total_fat: result.total.fat,
        total_fiber: result.total.fiber,
        total_sugar: result.total.sugar,
      })
      .select()
      .single();
    if (scanErr) console.error("save scan err", scanErr);

    return json({ ...result, scan_id: scan?.id });
  } catch (e) {
    console.error("analyze-meal err", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
