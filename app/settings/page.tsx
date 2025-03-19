"use client";

import SettingsForm from "@/components/SettingsForm";
import { Settings } from "@/lib/types";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) {
          throw new Error("Failed to fetch settings");
        }
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Error loading settings");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

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
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-red-500 mb-4">
            Failed to load settings. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Refresh Page
          </button>
        </div>
      )}
    </div>
  );
}
