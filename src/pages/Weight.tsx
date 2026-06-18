import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UpgradeModal } from "@/components/UpgradeModal";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Scale } from "lucide-react";

export default function Weight() {
  const { isPremium, profile, refresh } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState(profile?.height_cm?.toString() || "");

  const load = async () => {
    const { data } = await supabase.from("weight_logs").select("*").order("logged_at", { ascending: true });
    setLogs(data || []);
  };

  useEffect(() => { if (isPremium) load(); }, [isPremium]);
  useEffect(() => { setHeight(profile?.height_cm?.toString() || ""); }, [profile?.height_cm]);

  if (!isPremium) return <AppLayout><UpgradeModal open onOpenChange={() => {}} reason="Weight tracking is a Premium feature." /><div /></AppLayout>;

  const add = async () => {
    const w = parseFloat(weight);
    if (!w) return;
    const uid = (await supabase.auth.getUser()).data.user!.id;
    await supabase.from("weight_logs").insert({ weight_kg: w, user_id: uid });
    setWeight("");
    load();
  };

  const saveHeight = async () => {
    const h = parseFloat(height);
    if (!h || !profile) return;
    await supabase.from("profiles").update({ height_cm: h }).eq("id", profile.id);
    refresh();
  };

  const latest = logs[logs.length - 1]?.weight_kg;
  const h = parseFloat(height);
  const bmi = latest && h ? (latest / Math.pow(h / 100, 2)) : null;
  const bmiLabel = bmi ? (bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese") : "";

  const chartData = logs.map((l) => ({ date: l.logged_at.slice(5, 10), weight: Number(l.weight_kg) }));

  return (
    <AppLayout>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">Weight & BMI</h1>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card className="p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Scale className="h-4 w-4" /> Log weight</h2>
          <div className="flex gap-2">
            <Input type="number" step="0.1" placeholder="kg" value={weight} onChange={(e) => setWeight(e.target.value)} />
            <Button onClick={add}>Add</Button>
          </div>
          <div className="mt-4 space-y-2">
            <Label>Your height (cm)</Label>
            <div className="flex gap-2">
              <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
              <Button variant="outline" onClick={saveHeight}>Save</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
          <h2 className="font-semibold mb-4">BMI</h2>
          {bmi ? (
            <div>
              <div className="text-5xl font-bold">{bmi.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground mt-1">{bmiLabel}</div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Log your weight and set height to calculate BMI.</p>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Trend</h2>
        {chartData.length < 2 ? <p className="text-sm text-muted-foreground">Log a few entries to see your trend.</p> :
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>}
      </Card>
    </AppLayout>
  );
}
