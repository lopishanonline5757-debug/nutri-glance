import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Flame, Beef, Wheat, Droplet, Camera, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface DayTotals {
  calories: number; protein: number; carbs: number; fat: number;
}

export default function Dashboard() {
  const { profile, isPremium, subscriber } = useAuth();
  const [today, setToday] = useState<DayTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [scansToday, setScansToday] = useState(0);
  const [recent, setRecent] = useState<any[]>([]);
  const [waterMl, setWaterMl] = useState(0);

  useEffect(() => {
    const load = async () => {
      const since = new Date(); since.setHours(0, 0, 0, 0);
      const isoSince = since.toISOString();

      const [{ data: scans }, { data: water }] = await Promise.all([
        supabase.from("scans").select("*").gte("created_at", isoSince),
        supabase.from("water_logs").select("amount_ml").gte("logged_at", isoSince),
      ]);

      const t = (scans || []).reduce(
        (a: DayTotals, s: any) => ({
          calories: a.calories + (Number(s.total_calories) || 0),
          protein: a.protein + (Number(s.total_protein) || 0),
          carbs: a.carbs + (Number(s.total_carbs) || 0),
          fat: a.fat + (Number(s.total_fat) || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      setToday(t);
      setScansToday((scans || []).length);
      setWaterMl((water || []).reduce((a: number, w: any) => a + w.amount_ml, 0));

      const { data: r } = await supabase.from("scans").select("*").order("created_at", { ascending: false }).limit(5);
      setRecent(r || []);
    };
    load();
  }, []);

  const stats = [
    { label: "Calories", value: Math.round(today.calories), unit: "kcal", icon: Flame, color: "from-orange-500 to-red-500" },
    { label: "Protein", value: Math.round(today.protein), unit: "g", icon: Beef, color: "from-rose-500 to-pink-500" },
    { label: "Carbs", value: Math.round(today.carbs), unit: "g", icon: Wheat, color: "from-amber-500 to-yellow-500" },
    { label: "Fat", value: Math.round(today.fat), unit: "g", icon: Droplet, color: "from-blue-500 to-cyan-500" },
  ];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Hello, {profile?.full_name?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="text-muted-foreground mt-1">Here's your day at a glance.</p>
          </div>
          <div className="flex items-center gap-2">
            {isPremium ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium shadow-md">
                <Crown className="h-3.5 w-3.5" /> Premium
              </span>
            ) : (
              <Button asChild size="sm" variant="outline">
                <Link to="/pricing"><Crown className="h-4 w-4 mr-1" /> Upgrade</Link>
              </Button>
            )}
            <Button asChild className="bg-gradient-to-r from-primary to-secondary">
              <Link to="/scan"><Camera className="h-4 w-4 mr-1" /> Scan</Link>
            </Button>
          </div>
        </div>

        {!isPremium && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm">
                <strong>{Math.max(0, 3 - scansToday)}</strong> of 3 free scans remaining today.
              </p>
              <Link to="/pricing" className="text-sm font-medium text-primary hover:underline">
                Unlock unlimited →
              </Link>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5 backdrop-blur-xl bg-card/70 border-border/50 overflow-hidden relative">
                <div className={`absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br ${s.color} opacity-20 blur-2xl`} />
                <s.icon className="h-5 w-5 text-muted-foreground mb-3" />
                <div className="text-3xl font-bold tracking-tight">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.unit} {s.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Recent meals</h2>
              <Link to="/history" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            {recent.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No meals yet. Scan your first one!
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                    <div>
                      <div className="font-medium text-sm">{s.meal_name || "Meal"}</div>
                      <div className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{Math.round(s.total_calories || 0)}</div>
                      <div className="text-xs text-muted-foreground">kcal</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Hydration</h2>
              <Link to="/water" className="text-sm text-primary hover:underline">Track water</Link>
            </div>
            <div className="text-center py-6">
              <Droplet className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <div className="text-4xl font-bold">{(waterMl / 1000).toFixed(1)}<span className="text-lg text-muted-foreground"> L</span></div>
              <div className="text-sm text-muted-foreground mt-1">today · target 2.0 L</div>
              <div className="h-2 bg-muted rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-500" style={{ width: `${Math.min(100, (waterMl / 2000) * 100)}%` }} />
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </AppLayout>
  );
}
