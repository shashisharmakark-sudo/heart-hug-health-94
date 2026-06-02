This is a big build. Here's how I'll ship it in one pass, keeping it focused enough to actually land cleanly. Confirm and I'll start.

## 1. Role split at sign-in
- Landing route `/` (logged out) shows two big cards: **"I'm a Patient"** and **"I'm a Doctor"**.
- After signup, each user gets a role stored in a new `user_roles` table (`patient` | `doctor`) + a one-time onboarding flow before reaching the dashboard.
- Existing Petal sidebar stays; nav items change based on role.

## 2. Patient experience
- **Onboarding form** (`/onboarding/patient`) — colorful multi-step form:
  - Basics: name, age, gender, address, phone
  - Conditions / current disease, allergies
  - 10 matching questions (consultation style, urgency, communication preference, etc. from your list)
  - Emergency support block: toggle + category (babies / pregnant / elders / serious)
- Saved to `patient_profiles` table.
- **Dashboard**: today's reminders + medicines (existing) + new **"Find a doctor"** page with filter chips (specialty, experience years, condition-treated, consultation style, language).
- **Doctor detail** → "Request consultation" → creates a `consultations` row.
- **My care** page shows prescriptions + reminders the doctor added (with browser notification pop-ups — reusing existing `useReminderNotifications`).
- **"Generate my diet chart"** button → calls Lovable AI (google/gemini-2.5-flash) with patient profile + active prescriptions → renders a full day-wise chart.

## 3. Doctor experience
- **Onboarding form** (`/onboarding/doctor`) — colorful multi-step form:
  - Basics: name, specialty, qualifications, years of experience, languages, clinic address, fee
  - 10 personality/style questions from your list
  - Core fields / specialities (multi-select chips)
- On submit → a **Doctor Card** is generated (gradient card with avatar initials, specialty, style tags, fee, experience) shown on their dashboard and on the patient "Find a doctor" listing.
- **Doctor dashboard**: list of their assigned patients (from `consultations`). Clicking one opens patient profile → add **prescription** (medicine, dosage, instructions) and **reminders** (time, repeat). Both write to existing `medicines` + `reminders` tables scoped to that patient (with `prescribed_by` doctor id).

## 4. Smart matching
- When patient views "Find a doctor", we score each doctor:
  - specialty match with patient condition (+3)
  - consultation-style alignment between patient/doctor answers (+1 each match, up to +5)
  - emergency flag → push emergency-capable doctors to top
- Sorted list with a "Why this match" tooltip.

## 5. Reminders & alarms
- Existing browser-notification system stays. Add an in-app **alarm pop-up** (modal + sound via Web Audio API beep) when a reminder's time hits while the user is on the site. "Snooze 10 min" / "Mark done".

## 6. UI refresh
- Repalette `src/styles.css` to **light blue base, soft cream surfaces, mild red accent, black for emphasis** (replaces current green/red).
- Add hover lift + glow utilities, gradient cards, subtle background blobs.
- Keep current typography (Sora + Manrope).

## 7. Database changes (one migration)
- `user_roles` (id, user_id, role enum) + `has_role()` security-definer fn
- `patient_profiles` (user_id PK, age, gender, address, phone, condition, allergies, emergency_needed, emergency_category, answers jsonb)
- `doctor_profiles` (user_id PK, specialty, qualifications, experience_years, languages text[], clinic_address, fee, core_fields text[], answers jsonb, avatar_color)
- `consultations` (id, patient_id, doctor_id, status, created_at)
- Add `prescribed_by uuid`, `patient_id uuid` columns to `medicines` and `reminders` (nullable; existing rows = self-prescribed).
- RLS: patients see own data + public doctor profiles; doctors see own data + assigned patients' data.

## 8. Out of scope for this pass (call out)
- AI Health Narrative free-text triage
- Emotional heatmap dashboard
- AI Health Persona scores
- Voice reminders
These are great follow-ups; I'll ship the core first, then we can layer them.

## Technical notes
- One Supabase migration for the schema above.
- Server fn `generateDietChart` using `LOVABLE_API_KEY` → `google/gemini-2.5-flash`.
- Onboarding forms use `react-hook-form` + `zod`.
- Diet chart rendered as a styled day-by-day table in a printable card.
- All new routes nest under `_authenticated/`.

Reply **"go"** and I'll start with the migration, then the screens. If you want a smaller first slice (e.g. just role split + onboarding + doctor cards, then matching/prescriptions/diet next turn), say so.