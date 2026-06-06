
-- Consultations: ensure doctor_id is actually a doctor
DROP POLICY IF EXISTS "Patient creates consultation" ON public.consultations;
CREATE POLICY "Patient creates consultation"
ON public.consultations FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = patient_id
  AND public.has_role(doctor_id, 'doctor')
);

-- Medicines: require doctor role on doctor-scoped policies
DROP POLICY IF EXISTS "Doctor medicines select" ON public.medicines;
CREATE POLICY "Doctor medicines select"
ON public.medicines FOR SELECT
TO authenticated
USING (auth.uid() = prescribed_by AND public.has_role(auth.uid(), 'doctor'));

DROP POLICY IF EXISTS "Doctor medicines insert" ON public.medicines;
CREATE POLICY "Doctor medicines insert"
ON public.medicines FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = prescribed_by
  AND public.has_role(auth.uid(), 'doctor')
  AND EXISTS (
    SELECT 1 FROM public.consultations c
    WHERE c.doctor_id = auth.uid() AND c.patient_id = medicines.patient_id
  )
);

DROP POLICY IF EXISTS "Doctor medicines update" ON public.medicines;
CREATE POLICY "Doctor medicines update"
ON public.medicines FOR UPDATE
TO authenticated
USING (auth.uid() = prescribed_by AND public.has_role(auth.uid(), 'doctor'))
WITH CHECK (auth.uid() = prescribed_by AND public.has_role(auth.uid(), 'doctor'));

DROP POLICY IF EXISTS "Doctor medicines delete" ON public.medicines;
CREATE POLICY "Doctor medicines delete"
ON public.medicines FOR DELETE
TO authenticated
USING (auth.uid() = prescribed_by AND public.has_role(auth.uid(), 'doctor'));

-- Reminders: same role gating
DROP POLICY IF EXISTS "Doctor reminders select" ON public.reminders;
CREATE POLICY "Doctor reminders select"
ON public.reminders FOR SELECT
TO authenticated
USING (auth.uid() = prescribed_by AND public.has_role(auth.uid(), 'doctor'));

DROP POLICY IF EXISTS "Doctor reminders insert" ON public.reminders;
CREATE POLICY "Doctor reminders insert"
ON public.reminders FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = prescribed_by
  AND public.has_role(auth.uid(), 'doctor')
  AND EXISTS (
    SELECT 1 FROM public.consultations c
    WHERE c.doctor_id = auth.uid() AND c.patient_id = reminders.patient_id
  )
);

DROP POLICY IF EXISTS "Doctor reminders update" ON public.reminders;
CREATE POLICY "Doctor reminders update"
ON public.reminders FOR UPDATE
TO authenticated
USING (auth.uid() = prescribed_by AND public.has_role(auth.uid(), 'doctor'))
WITH CHECK (auth.uid() = prescribed_by AND public.has_role(auth.uid(), 'doctor'));

DROP POLICY IF EXISTS "Doctor reminders delete" ON public.reminders;
CREATE POLICY "Doctor reminders delete"
ON public.reminders FOR DELETE
TO authenticated
USING (auth.uid() = prescribed_by AND public.has_role(auth.uid(), 'doctor'));
