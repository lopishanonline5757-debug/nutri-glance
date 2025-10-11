import { Flame, Beef, Wheat, Droplet } from "lucide-react";
import { Card } from "@/components/ui/card";

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
  foodItems?: string[];
}

interface NutritionResultsProps {
  data: NutritionData;
}

const MacroCard = ({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: number; 
  unit: string; 
  color: string;
}) => (
  <Card className="p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold">{value}</span>
      <span className="text-muted-foreground">{unit}</span>
    </div>
  </Card>
);

export const NutritionResults = ({ data }: NutritionResultsProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Main Calories Card */}
      <Card className="p-8 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-2">Total Calories</p>
            <p className="text-5xl font-bold">{data.calories}</p>
            <p className="text-sm opacity-75 mt-2">kcal</p>
          </div>
          <div className="p-4 bg-white/20 rounded-full">
            <Flame className="h-12 w-12" />
          </div>
        </div>
      </Card>

      {/* Macros Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MacroCard
          icon={Beef}
          label="Protein"
          value={data.protein}
          unit="g"
          color="bg-secondary"
        />
        <MacroCard
          icon={Wheat}
          label="Carbs"
          value={data.carbs}
          unit="g"
          color="bg-accent"
        />
        <MacroCard
          icon={Droplet}
          label="Fat"
          value={data.fat}
          unit="g"
          color="bg-primary"
        />
      </div>

      {/* Additional Info */}
      {(data.servingSize || data.foodItems) && (
        <Card className="p-6">
          {data.servingSize && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Serving Size</h3>
              <p className="text-lg">{data.servingSize}</p>
            </div>
          )}
          
          {data.foodItems && data.foodItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Detected Items</h3>
              <div className="flex flex-wrap gap-2">
                {data.foodItems.map((item, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-muted rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
