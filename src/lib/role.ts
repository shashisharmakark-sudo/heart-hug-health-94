import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type Role = "patient" | "doctor";

export function useRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) {
      setRole(null);
      setHasProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    const r = (roleRow?.role as Role | undefined) ?? null;
    setRole(r);
    if (r === "patient") {
      const { data } = await supabase.from("patient_profiles").select("user_id").eq("user_id", user.id).maybeSingle();
      setHasProfile(!!data);
    } else if (r === "doctor") {
      const { data } = await supabase.from("doctor_profiles").select("user_id").eq("user_id", user.id).maybeSingle();
      setHasProfile(!!data);
    } else {
      setHasProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  return { role, hasProfile, loading, refresh };
}

import { assignInitialRole } from "./role.functions";

export async function setRoleForUser(_userId: string, role: Role) {
  // Role assignment is enforced server-side; users cannot self-assign roles
  // via the database. The server function only allows patient/doctor and
  // refuses to overwrite an existing role.
  await assignInitialRole({ data: { role } });
}
