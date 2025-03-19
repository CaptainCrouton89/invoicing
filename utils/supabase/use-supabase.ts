"use client";

import { Database } from "@/lib/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "./client";

export function useSupabase() {
  const [supabase] = useState<SupabaseClient<Database>>(() => createClient());
  const [user, setUser] = useState<
    Database["public"]["Tables"]["clients"]["Row"] | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      setUser(data.user as any);
      setLoading(false);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser((session?.user as any) || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { supabase, user, loading };
}
