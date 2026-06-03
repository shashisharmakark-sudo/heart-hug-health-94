CREATE TABLE public.emergency_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  category text NOT NULL,
  blood_group text,
  conditions text,
  notes text,
  guardian_name text NOT NULL,
  guardian_relation text,
  guardian_phone text NOT NULL,
  guardian_email text,
  secondary_guardian_name text,
  secondary_guardian_phone text,
  alert_popups boolean NOT NULL DEFAULT true,
  alert_sound boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_profiles TO authenticated;
GRANT ALL ON public.emergency_profiles TO service_role;

ALTER TABLE public.emergency_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own emergency profile"
ON public.emergency_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors view consulted patient emergency"
ON public.emergency_profiles
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.consultations c
  WHERE c.patient_id = emergency_profiles.user_id
    AND c.doctor_id = auth.uid()
));

CREATE TRIGGER emergency_profiles_updated_at
BEFORE UPDATE ON public.emergency_profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();