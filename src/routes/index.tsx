import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, FileText, Globe, Mail, Linkedin, Github, Target, GraduationCap, Rocket, Shield,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "CareerForge AI — One Profile. Infinite Opportunities." },
      { name: "description", content: "Fill your profile once. Generate ATS resumes, portfolios, cover letters, recruiter emails, LinkedIn summaries and more with AI." },
    ],
  }),
});

const features = [
  { icon: FileText, title: "ATS-Optimized Resumes", desc: "Multiple styles targeted at Google, Microsoft, Amazon, startups and roles from SWE to Data Science." },
  { icon: Globe, title: "AI Portfolio Site", desc: "Generated portfolio pages tuned to your real projects and stack." },
  { icon: Mail, title: "Cover Letters & Emails", desc: "Personalized cover letters and recruiter outreach in seconds." },
  { icon: Linkedin, title: "LinkedIn Summary", desc: "A polished 'About' section that reads like you wrote it." },
  { icon: Github, title: "GitHub README", desc: "A profile README that highlights your strongest work." },
  { icon: Target, title: "JD Analyzer", desc: "Paste any job description. See matched skills, gaps, and honest suggestions." },
  { icon: GraduationCap, title: "Skill Gap & Roadmap", desc: "Know exactly what to learn next for the role you want." },
  { icon: Shield, title: "Truthful by design", desc: "Everything is grounded in your real profile. No invented experience." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-hero-gradient">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span>CareerForge <span className="text-gradient-brand">AI</span></span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/auth"><Button size="sm">Get started</Button></Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-12 pb-24 text-center">
        <Badge variant="secondary" className="mb-6">Powered by AI · Grounded in your real profile</Badge>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          One Profile.<br/><span className="text-gradient-brand">Infinite Opportunities.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Fill your profile once. CareerForge AI turns it into ATS-optimized resumes, a portfolio site,
          cover letters, recruiter emails, a LinkedIn summary, a GitHub README, and a personalized learning roadmap.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/auth"><Button size="lg" className="gap-2"><Rocket className="h-4 w-4" /> Start free</Button></Link>
          <a href="#features"><Button size="lg" variant="outline">See what's inside</Button></a>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t bg-background/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} CareerForge AI</span>
          <span>One Profile. Infinite Opportunities.</span>
        </div>
      </footer>
    </div>
  );
}
