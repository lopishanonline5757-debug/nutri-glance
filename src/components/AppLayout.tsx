import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sparkles, LayoutDashboard, Camera, History, BarChart3, Droplet, Scale,
  Crown, User, Shield, LogOut, Menu, X, Moon, Sun
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scan", label: "Scan Meal", icon: Camera },
  { to: "/history", label: "History", icon: History },
  { to: "/reports", label: "Reports", icon: BarChart3, premium: true },
  { to: "/water", label: "Water", icon: Droplet, premium: true },
  { to: "/weight", label: "Weight & BMI", icon: Scale, premium: true },
];

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { profile, isPremium, isAdmin, signOut, refresh } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const toggleTheme = async () => {
    const next = !profile?.dark_mode;
    if (profile) {
      await supabase.from("profiles").update({ dark_mode: next }).eq("id", profile.id);
      await refresh();
    }
  };

  const SidebarContent = () => (
    <>
      <Link to="/dashboard" className="flex items-center gap-2 px-2 mb-8" onClick={() => setOpen(false)}>
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">NutriGlance</span>
      </Link>

      <nav className="space-y-1 flex-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span className="flex-1">{item.label}</span>
            {item.premium && !isPremium && <Crown className="h-3.5 w-3.5 text-secondary" />}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <Shield className="h-4 w-4" /> Admin
          </NavLink>
        )}
      </nav>

      <div className="space-y-1 border-t pt-4">
        {!isPremium && (
          <Link
            to="/pricing"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground shadow-md hover:opacity-90"
          >
            <Crown className="h-4 w-4" /> Upgrade to Premium
          </Link>
        )}
        <NavLink
          to="/profile"
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
          }
        >
          <User className="h-4 w-4" /> Profile
          {isPremium && <Crown className="h-3.5 w-3.5 ml-auto text-secondary" />}
        </NavLink>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {profile?.dark_mode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {profile?.dark_mode ? "Light mode" : "Dark mode"}
        </button>
        <button
          onClick={async () => { await signOut(); navigate("/"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold">NutriGlance</span>
        </Link>
        <Button size="icon" variant="ghost" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl p-4 pt-20 flex flex-col">
          <SidebarContent />
        </div>
      )}

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-64 h-screen sticky top-0 flex-col p-4 border-r bg-card/40 backdrop-blur-xl">
          <SidebarContent />
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
