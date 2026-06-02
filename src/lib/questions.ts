export interface QChoice { value: string; label: string }
export interface Question { key: string; q: string; options: QChoice[] }

export const PATIENT_QUESTIONS: Question[] = [
  { key: "priority", q: "What matters most to you during a consultation?", options: [
    { value: "detail", label: "Detailed explanation" },
    { value: "quick", label: "Quick treatment" },
    { value: "emotional", label: "Emotional support" },
    { value: "longterm", label: "Long-term guidance" },
  ]},
  { key: "describe", q: "How do you usually describe your symptoms?", options: [
    { value: "clear", label: "Very clearly" },
    { value: "confused", label: "Sometimes confused" },
    { value: "major", label: "Only major symptoms" },
    { value: "hard", label: "Difficult to explain" },
  ]},
  { key: "doctor_style", q: "What type of doctor makes you most comfortable?", options: [
    { value: "calm", label: "Calm and patient" },
    { value: "direct", label: "Straightforward and direct" },
    { value: "analytical", label: "Highly analytical" },
    { value: "friendly", label: "Friendly and conversational" },
  ]},
  { key: "urgency", q: "How urgent do you feel your condition is?", options: [
    { value: "emergency", label: "Emergency" },
    { value: "moderate", label: "Moderate concern" },
    { value: "routine", label: "Routine check-up" },
    { value: "preventive", label: "Preventive advice" },
  ]},
  { key: "focus", q: "I'd prefer a doctor who focuses on:", options: [
    { value: "medication", label: "Medication" },
    { value: "lifestyle", label: "Lifestyle improvement" },
    { value: "mental", label: "Mental wellness" },
    { value: "diagnostics", label: "Advanced diagnostics" },
  ]},
  { key: "stress", q: "How often do stress or emotions affect your health?", options: [
    { value: "frequently", label: "Frequently" },
    { value: "sometimes", label: "Sometimes" },
    { value: "rarely", label: "Rarely" },
    { value: "never", label: "Never" },
  ]},
  { key: "involvement", q: "How involved do you want to be in decisions?", options: [
    { value: "full", label: "Full explanations" },
    { value: "led", label: "Doctor-led decisions" },
    { value: "shared", label: "Shared decision making" },
    { value: "minimal", label: "Minimal discussion" },
  ]},
  { key: "communication", q: "What communication style helps you most?", options: [
    { value: "simple", label: "Simple language" },
    { value: "scientific", label: "Scientific detail" },
    { value: "visual", label: "Visual explanations" },
    { value: "stepbystep", label: "Step-by-step guidance" },
  ]},
  { key: "challenge", q: "Biggest challenge in maintaining your health?", options: [
    { value: "time", label: "Time management" },
    { value: "motivation", label: "Motivation" },
    { value: "financial", label: "Financial constraints" },
    { value: "understanding", label: "Understanding advice" },
  ]},
  { key: "outcome", q: "What outcome are you hoping for?", options: [
    { value: "relief", label: "Fast relief" },
    { value: "diagnosis", label: "Accurate diagnosis" },
    { value: "recovery", label: "Long-term recovery plan" },
    { value: "reassurance", label: "Emotional reassurance" },
  ]},
];

export const DOCTOR_QUESTIONS: Question[] = [
  { key: "style", q: "What best describes your consultation style?", options: [
    { value: "analytical", label: "Analytical and detailed" },
    { value: "direct", label: "Fast and efficient" },
    { value: "empathy", label: "Empathy-focused" },
    { value: "preventive", label: "Preventive-care focused" },
  ]},
  { key: "audience", q: "Patients you communicate with most effectively?", options: [
    { value: "children", label: "Children" },
    { value: "students", label: "Teenagers / Students" },
    { value: "professionals", label: "Working professionals" },
    { value: "elderly", label: "Elderly patients" },
  ]},
  { key: "explain", q: "How do you explain complex conditions?", options: [
    { value: "scientific", label: "Technical detail" },
    { value: "simple", label: "Simplified language" },
    { value: "visual", label: "Visual examples" },
    { value: "analogies", label: "Real-life analogies" },
  ]},
  { key: "attention", q: "Which patients need most attention?", options: [
    { value: "chronic", label: "Chronic illness" },
    { value: "mental", label: "Mental-stress cases" },
    { value: "emergency", label: "Emergency patients" },
    { value: "firsttime", label: "First-time consultations" },
  ]},
  { key: "time", q: "Preferred time per patient?", options: [
    { value: "under10", label: "Under 10 minutes" },
    { value: "10to20", label: "10–20 minutes" },
    { value: "20to40", label: "20–40 minutes" },
    { value: "complex", label: "Depends on complexity" },
  ]},
  { key: "appreciated", q: "What do patients appreciate most about you?", options: [
    { value: "calm", label: "Patience" },
    { value: "analytical", label: "Accuracy" },
    { value: "friendly", label: "Friendly behavior" },
    { value: "direct", label: "Fast diagnosis" },
  ]},
  { key: "philosophy", q: "Healthcare philosophy that fits you best?", options: [
    { value: "medication", label: "Treat symptoms quickly" },
    { value: "diagnostics", label: "Find root causes" },
    { value: "lifestyle", label: "Improve lifestyle" },
    { value: "preventive", label: "Focus on prevention" },
  ]},
  { key: "ai", q: "How comfortable are you with AI-assisted tools?", options: [
    { value: "very", label: "Very comfortable" },
    { value: "open", label: "Open to trying" },
    { value: "neutral", label: "Neutral" },
    { value: "traditional", label: "Prefer traditional" },
  ]},
  { key: "emotional", q: "Cases you handle best emotionally?", options: [
    { value: "anxious", label: "Anxious patients" },
    { value: "serious", label: "Serious illnesses" },
    { value: "sensitive", label: "Sensitive conversations" },
    { value: "highpressure", label: "High-pressure emergencies" },
  ]},
  { key: "promise", q: "What should patients expect most from your care?", options: [
    { value: "analytical", label: "Precision" },
    { value: "empathy", label: "Compassion" },
    { value: "direct", label: "Efficiency" },
    { value: "longterm", label: "Long-term guidance" },
  ]},
];

export const EMERGENCY_CATEGORIES = [
  { value: "baby", label: "Babies / Infants" },
  { value: "pregnant", label: "Pregnant women" },
  { value: "elder", label: "Elders / Seniors" },
  { value: "serious", label: "Serious / Critical condition" },
];

export const SPECIALTIES = [
  "General Physician", "Cardiology", "Pediatrics", "Gynecology", "Dermatology",
  "Neurology", "Orthopedics", "Psychiatry", "Endocrinology", "Pulmonology",
  "ENT", "Ophthalmology", "Gastroenterology", "Oncology", "Emergency Medicine",
];

export const CORE_FIELDS = [
  "Preventive care", "Chronic illness", "Mental wellness", "Emergency care",
  "Diabetes", "Hypertension", "Heart disease", "Allergies", "Pediatric care",
  "Women's health", "Geriatric care", "Sports medicine", "Nutrition",
];
