import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/UpgradeModal";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Download, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Reports() {
  const { isPremium } = useAuth();
  const { toast } = useToast();
  const [range, setRange] = useState<"week" | "month">("week");
  const [data, setData] = useState<any[]>([]);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPremium) return;
    const days = range === "week" ? 7 : 30;
    const since = new Date(Date.now() - days * 86400000);
    since.setHours(0, 0, 0, 0);
    supabase
      .from("scans")
      .select("created_at,total_calories,total_protein,total_carbs,total_fat")
      .gte("created_at", since.toISOString())
      .then(({ data: scans }) => {
        const map = new Map<string, any>();
        for (let i = 0; i < days; i++) {
          const d = new Date(since); d.setDate(since.getDate() + i);
          const key = d.toISOString().slice(0, 10);
          map.set(key, { date: key.slice(5), calories: 0, protein: 0, carbs: 0, fat: 0 });
        }
        (scans || []).forEach((s: any) => {
          const k = s.created_at.slice(0, 10);
          const row = map.get(k);
          if (row) {
            row.calories += Number(s.total_calories) || 0;
            row.protein += Number(s.total_protein) || 0;
            row.carbs += Number(s.total_carbs) || 0;
            row.fat += Number(s.total_fat) || 0;
          }
        });
        setData([...map.values()]);
      });
  }, [range, isPremium]);

  const getAdvice = async () => {
    setAiLoading(true);
    setAiText("");
    const { data: res, error } = await supabase.functions.invoke("diet-recommendations", { body: { goal: "balanced nutrition" } });
    setAiLoading(false);
    if (error || res?.error) toast({ title: "Error", description: res?.error || error?.message, variant: "destructive" });
    else setAiText(res.recommendations);
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { backgroundColor: "#ffffff", scale: 2 });
    const pdf = new jsPDF("p", "mm", "a4");
    const w = 210, h = (canvas.height * w) / canvas.width;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, h);
    pdf.save(`nutriglance-${range}-report.pdf`);
  };

  if (!isPremium) {
    return (
      <AppLayout>
        <UpgradeModal open={true} onOpenChange={() => {}} reason="Reports are a Premium feature." />
        <div />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Visualize trends in your nutrition.</p>
        </div>
        <Button onClick={exportPDF} variant="outline"><Download className="h-4 w-4 mr-1" /> Export PDF</Button>
      </div>

      <Tabs value={range} onValueChange={(v) => setRange(v as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="week">Weekly</TabsTrigger>
          <TabsTrigger value="month">Monthly</TabsTrigger>
        </TabsList>
      </Tabs>

      <div ref={reportRef} className="space-y-4">
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Calories</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="calories" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">Macros (g)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="protein" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="carbs" stackId="a" fill="hsl(var(--secondary))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="fat" stackId="a" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI Diet Recommendations</h2>
          <Button onClick={getAdvice} disabled={aiLoading}>
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
          </Button>
        </div>
        {aiText ? (
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{aiText}</div>
        ) : (
          <p className="text-sm text-muted-foreground">Click generate to get personalized diet advice based on your recent meals.</p>
        )}
      </Card>
    </AppLayout>
  );
}
