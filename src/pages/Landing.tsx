import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, BarChart3, Droplet, Crown, Sparkles, Check, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Nav */}
      <nav className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">NutriGlance</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/pricing" className="text-sm font-medium hover:text-primary hidden sm:inline">Pricing</Link>
            {user ? (
              <Button asChild><Link to="/dashboard">Dashboard</Link></Button>
            ) : (
              <>
                <Button variant="ghost" asChild><Link to="/auth">Sign In</Link></Button>
                <Button asChild><Link to="/auth">Get Started</Link></Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Nutrition</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
          Snap. Track. <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Thrive.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Instantly analyze any meal with AI. Track calories, macros, water, and weight — all in one beautiful place.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild className="bg-gradient-to-r from-primary to-secondary text-white shadow-xl">
            <Link to={user ? "/scan" : "/auth"}>Start Scanning Free <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild><Link to="/pricing">View Pricing</Link></Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { i: Camera, t: "AI Meal Scan", d: "Snap a photo, get full macro & micronutrient breakdown in seconds." },
          { i: BarChart3, t: "Daily & Weekly Reports", d: "Beautiful charts of your calories, protein, carbs, and fat trends." },
          { i: Droplet, t: "Water & Weight", d: "Build healthy habits with built-in trackers and BMI calculation." },
          { i: Crown, t: "AI Diet Coach", d: "Personalized recommendations based on your real eating patterns." },
          { i: Check, t: "Unlimited History", d: "Search and export your complete nutrition history at any time." },
          { i: Sparkles, t: "Apple-style UI", d: "Smooth, glassy, dark-mode-ready interface you'll love opening." },
        ].map((f, i) => (
          <div key={i} className="p-6 rounded-2xl bg-card/60 backdrop-blur-xl border shadow-sm hover:shadow-lg transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <f.i className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">{f.t}</h3>
            <p className="text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-primary to-secondary text-white shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Ready to know what you eat?</h2>
          <p className="opacity-90 mb-6">Free forever. Upgrade anytime.</p>
          <Button size="lg" variant="secondary" asChild>
            <Link to={user ? "/dashboard" : "/auth"}>Get Started</Link>
          </Button>
        </div>
      </section>

      <footer className="text-center text-sm text-muted-foreground py-8 border-t">
        © 2026 NutriGlance · Powered by AI
      </footer>
    </div>
  );
}
