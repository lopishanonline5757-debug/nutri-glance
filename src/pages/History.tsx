import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Crown } from "lucide-react";
import { Link } from "react-router-dom";

export default function History() {
  const { isPremium } = useAuth();
  const [scans, setScans] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      let query = supabase.from("scans").select("*").order("created_at", { ascending: false });
      if (!isPremium) {
        const since = new Date(Date.now() - 7 * 86400000).toISOString();
        query = query.gte("created_at", since);
      }
      const { data } = await query;
      setScans(data || []);
    };
    load();
  }, [isPremium]);

  const filtered = scans.filter((s) =>
    (s.meal_name || "").toLowerCase().includes(q.toLowerCase()) ||
    JSON.stringify(s.food || []).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground mt-1">
            {isPremium ? "All your scans" : "Last 7 days · upgrade for full history"}
          </p>
        </div>
        {!isPremium && (
          <Link to="/pricing" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
            <Crown className="h-4 w-4" /> Unlock full history
          </Link>
        )}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Search meals…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">No meals found.</Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <Card key={s.id} className="p-4 flex items-center justify-between hover:shadow-md transition-all">
              <div className="min-w-0">
                <div className="font-semibold truncate">{s.meal_name || "Meal"}</div>
                <div className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  P{Math.round(s.total_protein || 0)}g · C{Math.round(s.total_carbs || 0)}g · F{Math.round(s.total_fat || 0)}g
                </div>
              </div>
              <div className="text-right pl-3">
                <div className="text-2xl font-bold">{Math.round(s.total_calories || 0)}</div>
                <div className="text-xs text-muted-foreground">kcal</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
