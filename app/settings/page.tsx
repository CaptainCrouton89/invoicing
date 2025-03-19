"use client";

import SettingsForm from "@/components/SettingsForm";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "@/lib/types";
import { useSupabase } from "@/utils/supabase/use-supabase";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function SettingsPage() {
  const { supabase, user } = useSupabase();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 means no rows returned
          throw new Error("Failed to fetch settings");
        }

        setSettings(data || null);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Error loading settings");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [supabase, user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="mb-8">
        <p className="text-gray-600">
          Configure your business information, invoice defaults, and appearance
          settings.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : settings ? (
        <SettingsForm initialSettings={settings} />
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">
              Failed to load settings. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Refresh Page
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
