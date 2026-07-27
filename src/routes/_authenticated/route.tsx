import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, LayoutDashboard, User, FileText, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>CareerForge <span className="text-gradient-brand">AI</span></span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link to="/dashboard"><Button variant="ghost" size="sm" className="gap-2"><LayoutDashboard className="h-4 w-4"/>Dashboard</Button></Link>
            <Link to="/profile"><Button variant="ghost" size="sm" className="gap-2"><User className="h-4 w-4"/>Profile</Button></Link>
            <Link to="/resumes"><Button variant="ghost" size="sm" className="gap-2"><FileText className="h-4 w-4"/>Resumes</Button></Link>
            <Button variant="ghost" size="sm" className="gap-2" onClick={signOut}><LogOut className="h-4 w-4"/>Sign out</Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8"><Outlet /></main>
    </div>
  );
}