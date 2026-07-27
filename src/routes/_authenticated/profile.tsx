import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — CareerForge AI" }, { name: "description", content: "Manage your CareerForge AI profile." }] }),
});

type ProjectItem = { name: string; description: string; tech: string; link?: string };
type EducationItem = { school: string; degree: string; year: string; grade: string };
type ExperienceItem = { company: string; role: string; period: string; description: string };
type CertItem = { name: string; issuer: string; year: string };

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [p, setP] = useState<any>({
    full_name: "", headline: "", email: "", phone: "", location: "", summary: "",
    github_url: "", linkedin_url: "", portfolio_url: "",
    leetcode_url: "", codeforces_url: "", codechef_url: "", hackerrank_url: "", gfg_url: "",
    skills: { languages: "", frameworks: "", libraries: "", tools: "" },
    education: [] as EducationItem[],
    experience: [] as ExperienceItem[],
    projects: [] as ProjectItem[],
    certifications: [] as CertItem[],
    achievements: [] as string[],
  });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      if (data) {
        setP((prev: any) => ({
          ...prev, ...data,
          skills: (data.skills && typeof data.skills === "object" && !Array.isArray(data.skills)) ? { ...prev.skills, ...data.skills } : prev.skills,
          education: Array.isArray(data.education) ? data.education : [],
          experience: Array.isArray(data.experience) ? data.experience : [],
          projects: Array.isArray(data.projects) ? data.projects : [],
          certifications: Array.isArray(data.certifications) ? data.certifications : [],
          achievements: Array.isArray(data.achievements) ? data.achievements : [],
        }));
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("profiles").upsert({ id: u.user.id, ...p, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  }

  function set<K extends string>(k: K, v: any) { setP((s: any) => ({ ...s, [k]: v })); }
  function setSkill(k: string, v: string) { setP((s: any) => ({ ...s, skills: { ...s.skills, [k]: v } })); }
  function addItem(k: string, empty: any) { setP((s: any) => ({ ...s, [k]: [...(s[k] || []), empty] })); }
  function updateItem(k: string, i: number, v: any) { setP((s: any) => ({ ...s, [k]: s[k].map((x: any, idx: number) => idx === i ? v : x) })); }
  function removeItem(k: string, i: number) { setP((s: any) => ({ ...s, [k]: s[k].filter((_: any, idx: number) => idx !== i) })); }

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
          <p className="text-muted-foreground">This is the single source of truth for every AI-generated document.</p>
        </div>
        <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Basics</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={p.full_name} onChange={v=>set("full_name", v)}/>
          <Field label="Headline" value={p.headline} onChange={v=>set("headline", v)} placeholder="e.g. CS undergrad, AI/ML enthusiast"/>
          <Field label="Email" value={p.email || ""} onChange={v=>set("email", v)}/>
          <Field label="Phone" value={p.phone || ""} onChange={v=>set("phone", v)}/>
          <Field label="Location" value={p.location || ""} onChange={v=>set("location", v)}/>
          <div className="sm:col-span-2">
            <Label>Summary</Label>
            <Textarea rows={3} value={p.summary || ""} onChange={e=>set("summary", e.target.value)} placeholder="A short bio in your own words."/>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Links</CardTitle><CardDescription>All optional — add what you have.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="GitHub URL" value={p.github_url || ""} onChange={v=>set("github_url", v)}/>
          <Field label="LinkedIn URL" value={p.linkedin_url || ""} onChange={v=>set("linkedin_url", v)}/>
          <Field label="Portfolio URL" value={p.portfolio_url || ""} onChange={v=>set("portfolio_url", v)}/>
          <Field label="LeetCode" value={p.leetcode_url || ""} onChange={v=>set("leetcode_url", v)}/>
          <Field label="Codeforces" value={p.codeforces_url || ""} onChange={v=>set("codeforces_url", v)}/>
          <Field label="CodeChef" value={p.codechef_url || ""} onChange={v=>set("codechef_url", v)}/>
          <Field label="HackerRank" value={p.hackerrank_url || ""} onChange={v=>set("hackerrank_url", v)}/>
          <Field label="GeeksforGeeks" value={p.gfg_url || ""} onChange={v=>set("gfg_url", v)}/>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Skills</CardTitle><CardDescription>Comma-separated lists.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Languages" value={p.skills.languages || ""} onChange={v=>setSkill("languages", v)} placeholder="Python, JavaScript, C++"/>
          <Field label="Frameworks" value={p.skills.frameworks || ""} onChange={v=>setSkill("frameworks", v)} placeholder="React, Next.js, FastAPI"/>
          <Field label="Libraries" value={p.skills.libraries || ""} onChange={v=>setSkill("libraries", v)} placeholder="PyTorch, NumPy, Pandas"/>
          <Field label="Tools" value={p.skills.tools || ""} onChange={v=>setSkill("tools", v)} placeholder="Git, Docker, AWS"/>
        </CardContent>
      </Card>

      <ListCard<EducationItem>
        title="Education"
        items={p.education} onAdd={()=>addItem("education", { school:"", degree:"", year:"", grade:"" })}
        onRemove={i=>removeItem("education", i)}
        renderItem={(item, i) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="School" value={item.school} onChange={v=>updateItem("education", i, { ...item, school: v })}/>
            <Field label="Degree / Class" value={item.degree} onChange={v=>updateItem("education", i, { ...item, degree: v })}/>
            <Field label="Year" value={item.year} onChange={v=>updateItem("education", i, { ...item, year: v })}/>
            <Field label="Grade / CGPA / %" value={item.grade} onChange={v=>updateItem("education", i, { ...item, grade: v })}/>
          </div>
        )}
      />

      <ListCard<ExperienceItem>
        title="Experience & Internships"
        items={p.experience} onAdd={()=>addItem("experience", { company:"", role:"", period:"", description:"" })}
        onRemove={i=>removeItem("experience", i)}
        renderItem={(item, i) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Company" value={item.company} onChange={v=>updateItem("experience", i, { ...item, company: v })}/>
            <Field label="Role" value={item.role} onChange={v=>updateItem("experience", i, { ...item, role: v })}/>
            <Field label="Period" value={item.period} onChange={v=>updateItem("experience", i, { ...item, period: v })} placeholder="Jun 2024 – Aug 2024"/>
            <div className="sm:col-span-2"><Label>Description</Label><Textarea rows={3} value={item.description} onChange={e=>updateItem("experience", i, { ...item, description: e.target.value })}/></div>
          </div>
        )}
      />

      <ListCard<ProjectItem>
        title="Projects"
        items={p.projects} onAdd={()=>addItem("projects", { name:"", description:"", tech:"", link:"" })}
        onRemove={i=>removeItem("projects", i)}
        renderItem={(item, i) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" value={item.name} onChange={v=>updateItem("projects", i, { ...item, name: v })}/>
            <Field label="Tech" value={item.tech} onChange={v=>updateItem("projects", i, { ...item, tech: v })} placeholder="React, Node, Postgres"/>
            <Field label="Link" value={item.link || ""} onChange={v=>updateItem("projects", i, { ...item, link: v })}/>
            <div className="sm:col-span-2"><Label>Description</Label><Textarea rows={2} value={item.description} onChange={e=>updateItem("projects", i, { ...item, description: e.target.value })}/></div>
          </div>
        )}
      />

      <ListCard<CertItem>
        title="Certifications"
        items={p.certifications} onAdd={()=>addItem("certifications", { name:"", issuer:"", year:"" })}
        onRemove={i=>removeItem("certifications", i)}
        renderItem={(item, i) => (
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Name" value={item.name} onChange={v=>updateItem("certifications", i, { ...item, name: v })}/>
            <Field label="Issuer" value={item.issuer} onChange={v=>updateItem("certifications", i, { ...item, issuer: v })}/>
            <Field label="Year" value={item.year} onChange={v=>updateItem("certifications", i, { ...item, year: v })}/>
          </div>
        )}
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Achievements</CardTitle>
          <Button size="sm" variant="outline" onClick={()=>set("achievements", [...(p.achievements||[]), ""])}><Plus className="h-4 w-4 mr-1"/>Add</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {(p.achievements || []).map((a: string, i: number) => (
            <div key={i} className="flex gap-2">
              <Input value={a} onChange={e=>set("achievements", p.achievements.map((x: string, idx: number) => idx===i ? e.target.value : x))} placeholder="e.g. Winner, ABC Hackathon 2024"/>
              <Button size="icon" variant="ghost" onClick={()=>set("achievements", p.achievements.filter((_: string, idx: number) => idx!==i))}><Trash2 className="h-4 w-4"/></Button>
            </div>
          ))}
          {(!p.achievements || p.achievements.length===0) && <p className="text-sm text-muted-foreground">No achievements yet.</p>}
        </CardContent>
      </Card>

      <div className="flex justify-end"><Button onClick={save} disabled={saving} size="lg">{saving ? "Saving..." : "Save profile"}</Button></div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <div><Label>{label}</Label><Input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></div>;
}

function ListCard<T>({ title, items, onAdd, onRemove, renderItem }:
  { title: string; items: T[]; onAdd: () => void; onRemove: (i: number) => void; renderItem: (item: T, i: number) => React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button size="sm" variant="outline" onClick={onAdd}><Plus className="h-4 w-4 mr-1"/>Add</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nothing added yet.</p>}
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            {renderItem(item, i)}
            <div className="flex justify-end"><Button size="sm" variant="ghost" onClick={()=>onRemove(i)}><Trash2 className="h-4 w-4 mr-1"/>Remove</Button></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}