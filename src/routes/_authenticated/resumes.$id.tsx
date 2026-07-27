import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Printer, Copy, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/resumes/$id")({
  component: ResumeDetail,
  head: () => ({ meta: [{ title: "Resume — CareerForge AI" }, { name: "description", content: "Preview and export your generated resume." }] }),
});

function mdToHtml(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  const closeList = () => { if (inList) { out.push("</ul>"); inList = false; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${inline(esc(line.replace(/^\s*[-*]\s+/, "")))}</li>`);
      continue;
    }
    closeList();
    if (/^###\s+/.test(line)) out.push(`<h3>${inline(esc(line.replace(/^###\s+/, "")))}</h3>`);
    else if (/^##\s+/.test(line)) out.push(`<h2>${inline(esc(line.replace(/^##\s+/, "")))}</h2>`);
    else if (/^#\s+/.test(line)) out.push(`<h1>${inline(esc(line.replace(/^#\s+/, "")))}</h1>`);
    else if (/^---+$/.test(line)) out.push("<hr/>");
    else if (line.trim() === "") out.push("");
    else out.push(`<p>${inline(esc(line))}</p>`);
  }
  closeList();
  return out.join("\n");
  function inline(s: string) {
    return s
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  }
}

function ResumeDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("documents").select("*").eq("id", id).maybeSingle();
      if (error) toast.error(error.message);
      setDoc(data);
      setLoading(false);
    })();
  }, [id]);

  async function del() {
    if (!confirm("Delete this resume?")) return;
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    navigate({ to: "/resumes" });
  }

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Loading...</div>;
  if (!doc) return <p>Not found. <Link to="/resumes" className="underline">Go back</Link>.</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <Link to="/resumes"><Button variant="ghost" size="sm" className="gap-2 mb-1"><ArrowLeft className="h-4 w-4"/>Back</Button></Link>
          <h1 className="text-2xl font-bold">{doc.title}</h1>
          <div className="flex gap-2 mt-1">
            <Badge variant="secondary">{doc.style}</Badge>
            {typeof doc.ats_score === "number" && <Badge>ATS {doc.ats_score}</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={()=>{ navigator.clipboard.writeText(doc.markdown || ""); toast.success("Markdown copied"); }}><Copy className="h-4 w-4 mr-2"/>Copy MD</Button>
          <Button variant="outline" size="sm" onClick={()=>window.print()}><Printer className="h-4 w-4 mr-2"/>Print / PDF</Button>
          <Button variant="ghost" size="sm" onClick={del}><Trash2 className="h-4 w-4 mr-2"/>Delete</Button>
        </div>
      </div>
      <Card className="print:border-0 print:shadow-none">
        <CardContent className="p-8 print:p-0">
          <article className="prose-resume" dangerouslySetInnerHTML={{ __html: mdToHtml(doc.markdown || "") }} />
        </CardContent>
      </Card>
      <style>{`
        .prose-resume h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 .25rem; }
        .prose-resume h2 { font-size: 1.05rem; font-weight: 600; margin: 1.1rem 0 .35rem; text-transform: uppercase; letter-spacing: .04em; border-bottom: 1px solid oklch(0.9 0 0); padding-bottom: .15rem; }
        .prose-resume h3 { font-size: .98rem; font-weight: 600; margin: .8rem 0 .2rem; }
        .prose-resume p { margin: .25rem 0; line-height: 1.5; }
        .prose-resume ul { margin: .25rem 0 .5rem 1.1rem; list-style: disc; }
        .prose-resume li { margin: .15rem 0; line-height: 1.5; }
        .prose-resume a { color: oklch(0.55 0.22 275); text-decoration: underline; }
        .prose-resume hr { border: 0; border-top: 1px solid oklch(0.9 0 0); margin: 1rem 0; }
        @media print { body { background: white; } .prose-resume { color: #000; } }
      `}</style>
    </div>
  );
}