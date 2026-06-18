import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Droplet, Plus } from "lucide-react";

const QUICK = [200, 250, 500];
const TARGET = 2000;

export default function Water() {
  const { isPremium } = useAuth();
  const [today, setToday] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);

  const load = async () => {
    const since = new Date(); since.setHours(0, 0, 0, 0);
    const { data } = await supabase.from("water_logs").select("*").gte("logged_at", since.toISOString()).order("logged_at", { ascending: false });
    setLogs(data || []);
    setToday((data || []).reduce((a, w) => a + w.amount_ml, 0));
  };

  useEffect(() => { if (isPremium) load(); }, [isPremium]);

  const add = async (ml: number) => {
    await supabase.from("water_logs").insert({ amount_ml: ml, user_id: (await supabase.auth.getUser()).data.user!.id });
    load();
  };

  if (!isPremium) return <AppLayout><UpgradeModal open onOpenChange={() => {}} reason="Water tracking is a Premium feature." /><div /></AppLayout>;

  const pct = Math.min(100, (today / TARGET) * 100);

  return (
    <AppLayout>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">Water</h1>
      <Card className="p-8 text-center mb-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
        <Droplet className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <div className="text-5xl font-bold">{(today / 1000).toFixed(2)} L</div>
        <div className="text-sm text-muted-foreground mt-1">of {TARGET / 1000} L goal</div>
        <div className="h-3 bg-muted rounded-full mt-6 overflow-hidden max-w-md mx-auto">
          <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {QUICK.map((ml) => (
          <Button key={ml} variant="outline" className="h-20 flex-col gap-1" onClick={() => add(ml)}>
            <Plus className="h-4 w-4" />
            <span className="text-lg font-bold">{ml} ml</span>
          </Button>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Today's log</h2>
        {logs.length === 0 ? <p className="text-sm text-muted-foreground">No entries yet.</p> :
          <div className="space-y-2">
            {logs.map((l) => (
              <div key={l.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                <span>{new Date(l.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <span className="font-medium">{l.amount_ml} ml</span>
              </div>
            ))}
          </div>}
      </Card>
    </AppLayout>
  );
}
