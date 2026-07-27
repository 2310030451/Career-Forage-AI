import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GenInput = z.object({
  style: z.string().min(1).max(50),
  targetRole: z.string().min(1).max(100),
});

const RESUME_STYLES: Record<string, string> = {
  modern: "Modern, clean, single-column, minimal accents.",
  classic: "Classic, traditional serif look, two-column-safe.",
  ats: "Pure ATS-friendly: no columns, no tables, plain section headings.",
  minimal: "Extremely minimal, whitespace-heavy.",
  google: "Google-style: concise bullets with impact metrics.",
  microsoft: "Microsoft-style: outcomes-focused, business language.",
  amazon: "Amazon-style: STAR bullets aligned to Leadership Principles.",
  startup: "Startup-style: shipped-things focus, breadth of ownership.",
};

export const generateResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => GenInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile, error: profErr } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (profErr) throw new Error(profErr.message);
    if (!profile) throw new Error("Please fill in your profile first.");

    const styleGuide = RESUME_STYLES[data.style] ?? RESUME_STYLES.modern;

    const system = [
      "You are an expert resume writer and ATS optimizer.",
      "You MUST only use facts present in the user's profile JSON. Never invent employers, projects, dates, metrics, certifications, or achievements.",
      "If a section has no data, omit it. Do not fabricate.",
      "Return clean Markdown suitable for both reading and PDF printing.",
      "Use strong action verbs, quantify only when the profile provides numbers.",
      "Optimize for ATS keyword matching for the target role, using only truthful skills from the profile.",
    ].join(" ");

    const user = [
      `TARGET_ROLE: ${data.targetRole}`,
      `STYLE: ${data.style} — ${styleGuide}`,
      "USER_PROFILE_JSON:",
      "```json",
      JSON.stringify(profile, null, 2),
      "```",
      "",
      "Return ONLY the resume in Markdown. Start with the person's name as an H1.",
      "After the resume, on a new line, print exactly: `---ATS-SCORE---` followed by a single integer 0-100 estimating ATS fit for the target role based ONLY on truthful profile data.",
    ].join("\n");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("AI rate limit hit — please retry in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted for this workspace.");
      throw new Error(`AI request failed (${res.status}): ${body.slice(0, 300)}`);
    }
    const json = await res.json();
    const text: string = json.choices?.[0]?.message?.content ?? "";

    let markdown = text.trim();
    let ats: number | null = null;
    const m = markdown.match(/---ATS-SCORE---\s*(\d{1,3})/);
    if (m) {
      ats = Math.max(0, Math.min(100, parseInt(m[1], 10)));
      markdown = markdown.slice(0, m.index).trim();
    }

    const title = `${data.style[0].toUpperCase()}${data.style.slice(1)} · ${data.targetRole}`;
    const { data: doc, error: insErr } = await supabase.from("documents").insert({
      user_id: userId, kind: "resume", title, style: data.style, target_role: data.targetRole,
      markdown, ats_score: ats, content: {},
    }).select("id").single();
    if (insErr) throw new Error(insErr.message);

    return { id: doc.id, ats_score: ats, markdown };
  });