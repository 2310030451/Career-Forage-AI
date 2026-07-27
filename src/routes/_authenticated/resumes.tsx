import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateResume } from "@/lib/ai.functions";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Sparkles, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/resumes")({
  component: Resumes,
  head: () => ({ meta: [{ title: "Resumes — CareerForge AI" }, { name: "description", content: "Generate and manage AI resumes." }] }),
});

const STYLES = [
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "ats", label: "ATS Optimized" },
  { value: "minimal", label: "Minimal" },
  { value: "google", label: "Google-style" },
  { value: "microsoft", label: "Microsoft-style" },
  { value: "amazon", label: "Amazon-style" },
  { value: "startup", label: "Startup" },
];

function Resumes() {
  const navigate = useNavigate();
  const gen = useServerFn(generateResume);
  const [style, setStyle] = useState("ats");
  const [role, setRole] = useState("Software Engineer");
  const [busy, setBusy] = useState(false);
  const [docs, setDocs] = useState<any[]>([]);

  async function load() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase.from("documents").select("id,title,style,target_role,ats_score,created_at").eq("user_id", u.user.id).eq("kind", "resume").order("created_at", { ascending: false });
    setDocs(data || []);
  }
  useEffect(() => { load(); }, []);

  async function generate() {
    setBusy(true);
    try {
      const res = await gen({ data: { style, targetRole: role } });
      toast.success("Resume generated");
      navigate({ to: "/resumes/$id", params: { id: res.id } });
    } catch (e: any) {
      toast.error(e?.message || "Generation failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resumes</h1>
        <p className="text-muted-foreground">Generate a new resume from your profile, or open a previous one.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/>Generate a new resume</CardTitle>
        <CardDescription>Uses only truthful information from your profile.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] items-end">
          <div>
            <Label>Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>{STYLES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Target role</Label>
            <Input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Backend Engineer"/>
          </div>
          <Button onClick={generate} disabled={busy || !role.trim()} size="lg">
            {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Generating...</> : "Generate"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map(d => (
          <Link key={d.id} to="/resumes/$id" params={{ id: d.id }}>
            <Card className="h-full transition hover:shadow-md">
              <CardHeader>
                <div className="mb-2 grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4"/></div>
                <CardTitle className="text-base">{d.title}</CardTitle>
                <CardDescription>{new Date(d.created_at).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Badge variant="secondary">{d.style}</Badge>
                {typeof d.ats_score === "number" && <Badge>ATS {d.ats_score}</Badge>}
              </CardContent>
            </Card>
          </Link>
        ))}
        {docs.length === 0 && <p className="text-sm text-muted-foreground">No resumes yet. Generate one above.</p>}
      </div>
    </div>
  );
}