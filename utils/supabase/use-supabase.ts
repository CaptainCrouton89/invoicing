"use client";

import { useSupabaseContext } from "./supabase-provider";

export function useSupabase() {
  return useSupabaseContext();
}
