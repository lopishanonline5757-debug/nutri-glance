import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

interface NutritionResultsProps {
  data: NutritionData;
}

export const NutritionResults = ({ data }: NutritionResultsProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Total Summary Card */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <span>Total Nutrition</span>
            <Badge variant="secondary" className="ml-auto">
              {data.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/5">
              <div className="text-3xl font-bold text-primary">
                {data.total.calories}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Calories</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/5">
              <div className="text-3xl font-bold text-secondary">
                {data.total.protein}g
              </div>
              <div className="text-sm text-muted-foreground mt-1">Protein</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-accent/5">
              <div className="text-3xl font-bold text-accent">
                {data.total.carbs}g
              </div>
              <div className="text-sm text-muted-foreground mt-1">Carbs</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/5">
              <div className="text-3xl font-bold text-primary">
                {data.total.fat}g
              </div>
              <div className="text-sm text-muted-foreground mt-1">Fat</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Food Items */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Food Items Detected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.food.map((item, index) => (
              <div key={index}>
                {index > 0 && <Separator className="my-4" />}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.quantity}</p>
                    </div>
                    <Badge variant="outline">{item.calories} cal</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="p-2 rounded-md bg-secondary/10">
                      <div className="font-semibold text-secondary">{item.protein}g</div>
                      <div className="text-xs text-muted-foreground">Protein</div>
                    </div>
                    <div className="p-2 rounded-md bg-accent/10">
                      <div className="font-semibold text-accent">{item.carbs}g</div>
                      <div className="text-xs text-muted-foreground">Carbs</div>
                    </div>
                    <div className="p-2 rounded-md bg-primary/10">
                      <div className="font-semibold text-primary">{item.fat}g</div>
                      <div className="text-xs text-muted-foreground">Fat</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
