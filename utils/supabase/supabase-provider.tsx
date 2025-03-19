"use client";

import { Database } from "@/lib/database.types";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "./client";
type SupabaseContextType = {
  supabase: SupabaseClient<Database>;
  user: User | null;
  loading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState<SupabaseClient<Database>>(() => createClient());
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
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
      console.log("session", session?.user);
      setUser((session?.user as any) || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, pathname]);

  return (
    <SupabaseContext.Provider value={{ supabase, user, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabaseContext = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error(
      "useSupabaseContext must be used within a SupabaseProvider"
    );
  }
  return context;
};
