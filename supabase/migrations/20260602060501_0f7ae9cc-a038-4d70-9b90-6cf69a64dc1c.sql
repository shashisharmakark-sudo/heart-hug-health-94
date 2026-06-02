
-- Roles
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own roles" ON public.user_roles FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- Consultations (created first so other policies can reference it)
CREATE TABLE public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (patient_id, doctor_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultations TO authenticated;
GRANT ALL ON public.consultations TO service_role;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view consultations" ON public.consultations FOR SELECT TO authenticated
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);
CREATE POLICY "Patient creates consultation" ON public.consultations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Participants update consultation" ON public.consultations FOR UPDATE TO authenticated
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = patient_id OR auth.uid() = doctor_id);
CREATE POLICY "Patient deletes consultation" ON public.consultations FOR DELETE TO authenticated
  USING (auth.uid() = patient_id);

-- Patient profiles
CREATE TABLE public.patient_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  age int,
  gender text,
  address text,
  phone text,
  condition text,
  allergies text,
  emergency_needed boolean NOT NULL DEFAULT false,
  emergency_category text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_profiles TO authenticated;
GRANT ALL ON public.patient_profiles TO service_role;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients manage own profile" ON public.patient_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Doctors view consulted patient profiles" ON public.patient_profiles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.consultations c WHERE c.patient_id = patient_profiles.user_id AND c.doctor_id = auth.uid()));

-- Doctor profiles
CREATE TABLE public.doctor_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  specialty text NOT NULL,
  qualifications text,
  experience_years int NOT NULL DEFAULT 0,
  languages text[] NOT NULL DEFAULT '{}',
  clinic_address text,
  fee numeric,
  core_fields text[] NOT NULL DEFAULT '{}',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  avatar_color text NOT NULL DEFAULT 'sky',
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctor_profiles TO authenticated;
GRANT ALL ON public.doctor_profiles TO service_role;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors visible to all authenticated" ON public.doctor_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Doctor inserts own profile" ON public.doctor_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Doctor updates own profile" ON public.doctor_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Doctor deletes own profile" ON public.doctor_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Extend medicines and reminders
ALTER TABLE public.medicines ADD COLUMN IF NOT EXISTS patient_id uuid;
ALTER TABLE public.medicines ADD COLUMN IF NOT EXISTS prescribed_by uuid;
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS patient_id uuid;
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS prescribed_by uuid;
UPDATE public.medicines SET patient_id = user_id WHERE patient_id IS NULL;
UPDATE public.reminders SET patient_id = user_id WHERE patient_id IS NULL;

CREATE POLICY "Doctor medicines select" ON public.medicines FOR SELECT TO authenticated USING (auth.uid() = prescribed_by);
CREATE POLICY "Doctor medicines insert" ON public.medicines FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = prescribed_by AND EXISTS (SELECT 1 FROM public.consultations c WHERE c.doctor_id = auth.uid() AND c.patient_id = medicines.patient_id));
CREATE POLICY "Doctor medicines update" ON public.medicines FOR UPDATE TO authenticated USING (auth.uid() = prescribed_by) WITH CHECK (auth.uid() = prescribed_by);
CREATE POLICY "Doctor medicines delete" ON public.medicines FOR DELETE TO authenticated USING (auth.uid() = prescribed_by);
CREATE POLICY "Patient sees own patient medicines" ON public.medicines FOR SELECT TO authenticated USING (auth.uid() = patient_id);

CREATE POLICY "Doctor reminders select" ON public.reminders FOR SELECT TO authenticated USING (auth.uid() = prescribed_by);
CREATE POLICY "Doctor reminders insert" ON public.reminders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = prescribed_by AND EXISTS (SELECT 1 FROM public.consultations c WHERE c.doctor_id = auth.uid() AND c.patient_id = reminders.patient_id));
CREATE POLICY "Doctor reminders update" ON public.reminders FOR UPDATE TO authenticated USING (auth.uid() = prescribed_by) WITH CHECK (auth.uid() = prescribed_by);
CREATE POLICY "Doctor reminders delete" ON public.reminders FOR DELETE TO authenticated USING (auth.uid() = prescribed_by);
CREATE POLICY "Patient sees own patient reminders" ON public.reminders FOR SELECT TO authenticated USING (auth.uid() = patient_id);

CREATE TRIGGER trg_patient_profiles_updated BEFORE UPDATE ON public.patient_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_doctor_profiles_updated BEFORE UPDATE ON public.doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
