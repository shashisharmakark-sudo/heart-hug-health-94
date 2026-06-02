import type { Question } from "./questions";
import { PATIENT_QUESTIONS, DOCTOR_QUESTIONS } from "./questions";

// Map matching keys between patient & doctor answers (semantic alignment)
const STYLE_ALIGN: Record<string, string[]> = {
  // patient priority -> doctor style/philosophy/promise
  detail: ["analytical", "scientific"],
  quick: ["direct"],
  emotional: ["empathy"],
  longterm: ["longterm", "preventive", "lifestyle"],
};

interface PatientAns { [k: string]: string }
interface DoctorRow {
  user_id: string;
  full_name: string;
  specialty: string;
  experience_years: number;
  languages: string[];
  fee: number | null;
  core_fields: string[];
  answers: PatientAns;
  avatar_color: string;
  bio?: string | null;
  clinic_address?: string | null;
}

interface PatientProfile {
  condition?: string | null;
  emergency_needed?: boolean;
  emergency_category?: string | null;
  answers: PatientAns;
}

export interface MatchResult {
  doctor: DoctorRow;
  score: number;
  reasons: string[];
}

export function matchDoctors(patient: PatientProfile, doctors: DoctorRow[]): MatchResult[] {
  return doctors
    .map((doc) => {
      const reasons: string[] = [];
      let score = 0;

      // Specialty match against patient condition keywords
      const cond = (patient.condition ?? "").toLowerCase();
      if (cond && doc.specialty.toLowerCase().split(/\W+/).some((w) => w && cond.includes(w))) {
        score += 4; reasons.push(`Specializes in ${doc.specialty}`);
      }
      // Core fields match against condition
      doc.core_fields?.forEach((cf) => {
        if (cond && cond.includes(cf.toLowerCase().split(" ")[0])) {
          score += 2; reasons.push(`Treats ${cf}`);
        }
      });

      // Emergency boost
      if (patient.emergency_needed) {
        if (doc.specialty === "Emergency Medicine" || doc.core_fields?.includes("Emergency care")) {
          score += 5; reasons.push("Handles emergency care");
        }
        if (patient.emergency_category === "baby" && doc.specialty === "Pediatrics") {
          score += 5; reasons.push("Pediatric specialist");
        }
        if (patient.emergency_category === "pregnant" && doc.specialty === "Gynecology") {
          score += 5; reasons.push("Gynecology specialist");
        }
      }

      // Style alignment
      const pAns = patient.answers || {};
      const dAns = doc.answers || {};
      const priorityTargets = STYLE_ALIGN[pAns.priority] ?? [];
      if (priorityTargets.includes(dAns.style)) { score += 2; reasons.push("Consultation style matches"); }
      if (pAns.doctor_style && dAns.appreciated === pAns.doctor_style) { score += 1; reasons.push("Personality fits"); }
      if (pAns.focus && dAns.philosophy === pAns.focus) { score += 1; reasons.push("Shares your focus"); }
      if (pAns.communication && dAns.explain === pAns.communication) { score += 1; reasons.push("Explains the way you prefer"); }
      if (pAns.urgency === "emergency" && dAns.emotional === "highpressure") { score += 2; reasons.push("Comfortable in emergencies"); }

      // Experience boost
      score += Math.min(doc.experience_years / 10, 2);

      return { doctor: doc, score: Math.round(score * 10) / 10, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

export { PATIENT_QUESTIONS, DOCTOR_QUESTIONS };
export type { Question };
