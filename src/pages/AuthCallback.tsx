import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const readAuthError = () => {
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return (
    params.get("error_description") ||
    params.get("error") ||
    hashParams.get("error_description") ||
    hashParams.get("error")
  );
};

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const finishAuth = async () => {
      const authError = readAuthError();
      if (authError) {
        toast({ title: "Authentication failed", description: authError, variant: "destructive" });
        navigate("/auth", { replace: true });
        return;
      }

      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          toast({ title: "Authentication failed", description: error.message, variant: "destructive" });
          navigate("/auth", { replace: true });
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        toast({
          title: "Authentication failed",
          description: error?.message || "No session was returned. Try signing in again.",
          variant: "destructive",
        });
        navigate("/auth", { replace: true });
        return;
      }

      toast({ title: "Signed in", description: "Your account is ready." });
      navigate("/dashboard", { replace: true });
    };

    finishAuth();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
