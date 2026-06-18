import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const perks = [
  "Unlimited meal scans",
  "Unlimited history",
  "Weekly & monthly reports",
  "Water & weight tracking",
  "AI diet recommendations",
  "Export PDF reports",
];

export const UpgradeModal = ({ open, onOpenChange, reason }: { open: boolean; onOpenChange: (o: boolean) => void; reason?: string }) => {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center mb-2">
            <Crown className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">Upgrade to Premium</DialogTitle>
          <DialogDescription className="text-center">
            {reason || "Unlock the full NutriGlance experience."}
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 my-4">
          {perks.map((p) => (
            <li key={p} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" /> {p}
            </li>
          ))}
        </ul>
        <Button className="w-full bg-gradient-to-r from-primary to-secondary" onClick={() => { onOpenChange(false); navigate("/pricing"); }}>
          <Crown className="h-4 w-4 mr-2" /> See Plans
        </Button>
      </DialogContent>
    </Dialog>
  );
};
