import { Stethoscope, MapPin, Languages, Award } from "lucide-react";

const COLOR_BG: Record<string, string> = {
  sky: "linear-gradient(135deg,#bae6fd,#0284c7)",
  rose: "linear-gradient(135deg,#fecdd3,#e11d48)",
  violet: "linear-gradient(135deg,#ddd6fe,#7c3aed)",
  amber: "linear-gradient(135deg,#fde68a,#d97706)",
  emerald: "linear-gradient(135deg,#a7f3d0,#059669)",
};

export interface DoctorCardData {
  user_id: string;
  full_name: string;
  specialty: string;
  experience_years: number;
  languages: string[];
  fee: number | null;
  core_fields: string[];
  avatar_color: string;
  bio?: string | null;
  clinic_address?: string | null;
}

export function DoctorCard({ doc, score, reasons, onAction, actionLabel }: {
  doc: DoctorCardData; score?: number; reasons?: string[];
  onAction?: () => void; actionLabel?: string;
}) {
  const initials = doc.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="hover-lift overflow-hidden rounded-3xl border border-border/60 bg-card shadow-petal">
      <div className="flex items-center gap-4 p-5" style={{ background: COLOR_BG[doc.avatar_color] || COLOR_BG.sky }}>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 font-display text-xl font-bold text-ink shadow-soft">
          {initials}
        </div>
        <div className="flex-1 text-white drop-shadow">
          <p className="font-display text-xl font-semibold">Dr. {doc.full_name}</p>
          <p className="text-sm opacity-90 flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" /> {doc.specialty}</p>
        </div>
        {score !== undefined && (
          <div className="rounded-2xl bg-white/95 px-3 py-1.5 text-sm font-semibold text-primary shadow-petal">
            {score} match
          </div>
        )}
      </div>
      <div className="space-y-3 p-5">
        {doc.bio && <p className="text-sm text-ink/80">{doc.bio}</p>}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Award className="h-3 w-3" /> {doc.experience_years}y exp</span>
          {doc.languages?.length > 0 && <span className="inline-flex items-center gap-1"><Languages className="h-3 w-3" /> {doc.languages.join(", ")}</span>}
          {doc.clinic_address && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {doc.clinic_address}</span>}
          {doc.fee != null && <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">₹{doc.fee}</span>}
        </div>
        {doc.core_fields?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {doc.core_fields.slice(0, 5).map((c) => (
              <span key={c} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">{c}</span>
            ))}
          </div>
        )}
        {reasons && reasons.length > 0 && (
          <div className="rounded-xl bg-gradient-blossom p-3 text-xs text-ink">
            <p className="font-semibold">Why this match</p>
            <ul className="mt-1 list-disc pl-4 space-y-0.5">
              {reasons.slice(0, 4).map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
        {onAction && (
          <button onClick={onAction} className="w-full rounded-full bg-gradient-bloom px-4 py-2 text-sm font-medium text-primary-foreground shadow-petal hover:opacity-95">
            {actionLabel ?? "Request consultation"}
          </button>
        )}
      </div>
    </div>
  );
}
