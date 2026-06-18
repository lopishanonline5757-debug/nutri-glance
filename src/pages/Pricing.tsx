import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Crown, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const features = [
  { name: "Meal scans per day", free: "3", premium: "Unlimited" },
  { name: "History retention", free: "7 days", premium: "Forever" },
  { name: "Weekly & monthly reports", free: false, premium: true },
  { name: "Water tracker", free: false, premium: true },
  { name: "Weight & BMI", free: false, premium: true },
  { name: "AI diet recommendations", free: false, premium: true },
  { name: "Export PDF reports", free: false, premium: true },
  { name: "Priority AI processing", free: false, premium: true },
  { name: "No ads", free: false, premium: true },
];

export default function Pricing() {
  const { user, isPremium } = useAuth();
  const { toast } = useToast();

  const checkout = (_plan: "monthly" | "yearly") => {
    toast({
      title: "Payments coming soon",
      description: "Stripe checkout will be enabled shortly. Stay tuned!",
    });
  };

  return (
    <AppLayout>
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Choose your plan</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Simple, transparent pricing</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Start free. Upgrade when you're ready to unlock the full power of AI nutrition tracking.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
        {/* Free */}
        <Card className="p-8">
          <div className="text-sm font-medium text-muted-foreground mb-2">Free</div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-muted-foreground">/forever</span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Get started with the basics.</p>
          <Button variant="outline" className="w-full mb-6" disabled={!isPremium}>
            {isPremium ? "Downgrade" : "Current plan"}
          </Button>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> 3 scans per day</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> 7-day history</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Basic nutrition</li>
          </ul>
        </Card>

        {/* Monthly */}
        <Card className="p-8 border-primary/40 shadow-xl relative bg-gradient-to-br from-primary/5 to-transparent">
          <div className="text-sm font-medium text-primary mb-2 flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5" /> Monthly Premium
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-bold">$7.9</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Full access, flexible.</p>
          <Button onClick={() => checkout("monthly")} className="w-full mb-6 bg-gradient-to-r from-primary to-secondary">
            {isPremium ? "Manage" : "Start Monthly"}
          </Button>
          <ul className="space-y-2 text-sm">
            {features.slice(0, 5).map((f) => (
              <li key={f.name} className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {f.name}</li>
            ))}
          </ul>
        </Card>

        {/* Yearly */}
        <Card className="p-8 border-secondary/40 shadow-2xl relative bg-gradient-to-br from-secondary/10 to-primary/5 scale-[1.02]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-secondary to-primary text-white text-xs font-bold shadow">
            Save 40%
          </div>
          <div className="text-sm font-medium text-secondary mb-2 flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5" /> Yearly Premium
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-bold">$38.5</span>
            <span className="text-muted-foreground">/year</span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Just $3.21/month, billed yearly.</p>
          <Button onClick={() => checkout("yearly")} className="w-full mb-6 bg-gradient-to-r from-secondary to-primary">
            {isPremium ? "Manage" : "Start Yearly"}
          </Button>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2 font-medium"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Everything in Monthly</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Save $56/year</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Priority support</li>
          </ul>
        </Card>
      </div>

      {/* Comparison */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Compare plans</h2>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-4 font-semibold">Feature</th>
                <th className="p-4 font-semibold">Free</th>
                <th className="p-4 font-semibold text-primary">Premium</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.name} className="border-t">
                  <td className="p-4">{f.name}</td>
                  <td className="p-4 text-center">
                    {typeof f.free === "boolean" ? (f.free ? <Check className="h-4 w-4 inline text-primary" /> : <X className="h-4 w-4 inline text-muted-foreground" />) : f.free}
                  </td>
                  <td className="p-4 text-center">
                    {typeof f.premium === "boolean" ? (f.premium ? <Check className="h-4 w-4 inline text-primary" /> : <X className="h-4 w-4 inline text-muted-foreground" />) : f.premium}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        {!user && (
          <div className="text-center mt-8">
            <Button asChild size="lg"><Link to="/auth">Create your free account</Link></Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
