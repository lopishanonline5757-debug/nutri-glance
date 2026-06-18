import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Mail, User, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { profile, subscriber, isPremium, refresh, user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await supabase.from("profiles").update({ full_name: name }).eq("id", profile!.id);
    await refresh();
    setSaving(false);
    toast({ title: "Saved" });
  };

  return (
    <AppLayout>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">Profile</h1>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><User className="h-4 w-4" /> Account</h2>
          <div className="space-y-4">
            <div>
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" /> {user?.email}
              </div>
            </div>
            <Button onClick={save} disabled={saving}>Save changes</Button>
          </div>
        </Card>

        <Card className={`p-6 ${isPremium ? "bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30" : ""}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Plan</h2>
            {isPremium && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-medium"><Crown className="h-3 w-3" /> Premium</span>}
          </div>
          <div className="text-2xl font-bold mb-1 capitalize">{subscriber?.plan || "free"}</div>
          <div className="text-sm text-muted-foreground capitalize">{subscriber?.status || "inactive"}</div>
          {subscriber?.current_period_end && (
            <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {subscriber.cancel_at_period_end ? "Ends" : "Renews"} {new Date(subscriber.current_period_end).toLocaleDateString()}
            </div>
          )}
          <div className="mt-4 space-y-2">
            {isPremium ? (
              <Button variant="outline" className="w-full" disabled>Manage Subscription</Button>
            ) : (
              <Button asChild className="w-full bg-gradient-to-r from-primary to-secondary">
                <Link to="/pricing"><Crown className="h-4 w-4 mr-1" /> Upgrade</Link>
              </Button>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Billing history</h2>
        <p className="text-sm text-muted-foreground">No invoices yet. Billing history appears here after your first payment.</p>
      </Card>
    </AppLayout>
  );
}
