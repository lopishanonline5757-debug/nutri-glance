import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ImageUpload } from "@/components/ImageUpload";
import { NutritionResults } from "@/components/NutritionResults";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

export default function Scan() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { toast } = useToast();

  const handleImage = (file: File) => {
    setIsAnalyzing(true);
    setData(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const { data: res, error } = await supabase.functions.invoke("analyze-meal", { body: { imageBase64: base64 } });
        if (error) throw new Error(error.message);
        if (res?.limit_reached) {
          setShowUpgrade(true);
          return;
        }
        if (res?.error) throw new Error(res.error);
        setData(res);
        toast({ title: "Analysis complete!", description: res.meal_name });
      } catch (e: any) {
        toast({ title: "Analysis failed", description: e.message, variant: "destructive" });
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.onerror = () => { setIsAnalyzing(false); toast({ title: "Read error", variant: "destructive" }); };
    reader.readAsDataURL(file);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Scan a meal</h1>
        <p className="text-muted-foreground mb-8">Snap or upload a photo to get instant nutrition.</p>

        {isAnalyzing && (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing your meal…</p>
          </div>
        )}

        {!isAnalyzing && !data && <ImageUpload onImageSelect={handleImage} isAnalyzing={isAnalyzing} />}

        {!isAnalyzing && data && (
          <div className="space-y-6">
            <Button onClick={() => setData(null)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1" /> Scan another
            </Button>
            <NutritionResults data={data} />
          </div>
        )}

        <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} reason="You've used all 3 free scans today." />
      </div>
    </AppLayout>
  );
}
