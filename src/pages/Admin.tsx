import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, Crown, DollarSign, Camera, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";

const MONTHLY_PRICE = 7.9;
const YEARLY_PRICE = 38.5;

export default function Admin() {
  const [stats, setStats] = useState({ total: 0, premium: 0, active: 0, scans: 0, signupsToday: 0, mrr: 0, revenue: 0 });
  const [signupsData, setSignupsData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ count: total }, { data: subs }, { count: scans }] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("subscribers").select("plan,status,created_at"),
        supabase.from("scans").select("id", { count: "exact", head: true }),
      ]);

      const premium = (subs || []).filter((s: any) => (s.plan === "monthly" || s.plan === "yearly") && (s.status === "active" || s.status === "trialing"));
      const monthlyCount = premium.filter((s: any) => s.plan === "monthly").length;
      const yearlyCount = premium.filter((s: any) => s.plan === "yearly").length;
      const mrr = monthlyCount * MONTHLY_PRICE + yearlyCount * (YEARLY_PRICE / 12);
      const revenue = monthlyCount * MONTHLY_PRICE + yearlyCount * YEARLY_PRICE;

      // signups last 14 days
      const { data: profiles } = await supabase.from("profiles").select("created_at").gte("created_at", new Date(Date.now() - 14 * 86400000).toISOString());
      const map = new Map<string, number>();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        map.set(d, 0);
      }
      (profiles || []).forEach((p: any) => {
        const k = p.created_at.slice(0, 10);
        if (map.has(k)) map.set(k, (map.get(k) || 0) + 1);
      });
      setSignupsData([...map.entries()].map(([date, count]) => ({ date: date.slice(5), count })));

      const todayKey = new Date().toISOString().slice(0, 10);
      const signupsToday = (profiles || []).filter((p: any) => p.created_at.startsWith(todayKey)).length;

      setStats({
        total: total || 0,
        premium: premium.length,
        active: premium.length,
        scans: scans || 0,
        signupsToday,
        mrr: Math.round(mrr * 100) / 100,
        revenue: Math.round(revenue * 100) / 100,
      });
    };
    load();
  }, []);

  const cards = [
    { label: "Total users", value: stats.total, icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Premium users", value: stats.premium, icon: Crown, color: "from-primary to-secondary" },
    { label: "Active subscriptions", value: stats.active, icon: TrendingUp, color: "from-green-500 to-emerald-500" },
    { label: "Monthly recurring revenue", value: `$${stats.mrr}`, icon: DollarSign, color: "from-emerald-500 to-teal-500" },
    { label: "Total revenue", value: `$${stats.revenue}`, icon: DollarSign, color: "from-violet-500 to-purple-500" },
    { label: "Signups today", value: stats.signupsToday, icon: Users, color: "from-orange-500 to-red-500" },
    { label: "Food scans", value: stats.scans, icon: Camera, color: "from-pink-500 to-rose-500" },
  ];

  return (
    <AppLayout>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Admin dashboard</h1>
      <p className="text-muted-foreground mb-8">Realtime KPIs for NutriGlance.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 relative overflow-hidden">
            <div className={`absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br ${c.color} opacity-20 blur-2xl`} />
            <c.icon className="h-5 w-5 text-muted-foreground mb-2" />
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Signups (last 14 days)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={signupsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </AppLayout>
  );
}
