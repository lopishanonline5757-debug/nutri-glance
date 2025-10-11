import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { NutritionResults } from "@/components/NutritionResults";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionData {
  status: string;
  food: FoodItem[];
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const { toast } = useToast();

  const handleImageSelect = async (file: File) => {
    setIsAnalyzing(true);
    setNutritionData(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        try {
          const { data, error } = await supabase.functions.invoke('analyze-meal', {
            body: { imageBase64: base64Image }
          });

          if (error) {
            console.error('Function error:', error);
            throw new Error(error.message);
          }

          if (data.error) {
            throw new Error(data.error);
          }

          // Handle webhook response format: [{ output: { status, food, total } }]
          const webhookData = Array.isArray(data) ? data[0]?.output : data;
          
          if (!webhookData || !webhookData.total) {
            throw new Error('Invalid response format from analysis service');
          }

          setNutritionData(webhookData);
          toast({
            title: "Analysis Complete!",
            description: "Your meal has been analyzed successfully.",
          });
        } catch (err) {
          console.error('Analysis error:', err);
          toast({
            title: "Analysis Failed",
            description: err instanceof Error ? err.message : "Failed to analyze the image. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsAnalyzing(false);
        }
      };

      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read the image file.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
      };
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setNutritionData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 animate-fade-in">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Nutrition Analysis</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in">
          Hill Calories AI
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in">
          Snap a photo of your meal and get instant macronutrient breakdowns. 
          Simple, fast, and accurate nutrition tracking.
        </p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-lg text-muted-foreground">Analyzing your meal...</p>
            <p className="text-sm text-muted-foreground">This may take a few moments</p>
          </div>
        )}

        {!isAnalyzing && !nutritionData && (
          <ImageUpload onImageSelect={handleImageSelect} isAnalyzing={isAnalyzing} />
        )}

        {!isAnalyzing && nutritionData && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Button 
                onClick={resetAnalysis} 
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Analyze Another Meal
              </Button>
            </div>
            <NutritionResults data={nutritionData} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground border-t">
        <p>© 2025 Hill Calories AI. Powered by advanced AI nutrition analysis.</p>
      </footer>
    </div>
  );
};

export default Index;
