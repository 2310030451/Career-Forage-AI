import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, FileText, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — CareerForge AI" }, { name: "description", content: "Your CareerForge AI dashboard." }] }),
});

function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Complete your profile, then generate resumes and more with AI.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="mb-2 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><User className="h-5 w-5"/></div>
            <CardTitle>1. Your profile</CardTitle>
            <CardDescription>Add your education, skills, projects, experience and links.</CardDescription>
          </CardHeader>
          <CardContent><Link to="/profile"><Button variant="outline" className="w-full gap-2">Edit profile <ArrowRight className="h-4 w-4"/></Button></Link></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="mb-2 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Sparkles className="h-5 w-5"/></div>
            <CardTitle>2. Generate a resume</CardTitle>
            <CardDescription>Pick a style and role — AI drafts it from your profile.</CardDescription>
          </CardHeader>
          <CardContent><Link to="/resumes"><Button className="w-full gap-2">Create resume <ArrowRight className="h-4 w-4"/></Button></Link></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="mb-2 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="h-5 w-5"/></div>
            <CardTitle>3. Review & export</CardTitle>
            <CardDescription>View your generated resumes, copy markdown, or print to PDF.</CardDescription>
          </CardHeader>
          <CardContent><Link to="/resumes"><Button variant="outline" className="w-full gap-2">Go to resumes <ArrowRight className="h-4 w-4"/></Button></Link></CardContent>
        </Card>
      </div>
    </div>
  );
}