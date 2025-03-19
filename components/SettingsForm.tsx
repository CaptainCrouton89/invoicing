"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "@/lib/types";
import { useSupabase } from "@/utils/supabase/use-supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type SettingsFormProps = {
  initialSettings?: Settings;
};

const SettingsForm = ({ initialSettings }: SettingsFormProps) => {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    } else {
      fetchSettings();
    }
  }, [initialSettings]);

  const fetchSettings = async () => {
    if (!user) {
      toast.error("You must be logged in to view settings");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows returned
        throw new Error("Failed to fetch settings");
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings if none exist
        const defaultSettings: Partial<Settings> = {
          user_id: user.id,
          business_name: "",
          invoice_prefix: "INV-",
          next_invoice_number: 1001,
          tax_rate: 0,
          theme_color: "#3b82f6", // Default blue
          footer_notes: "Thank you for your business.",
        };

        const { data: newSettings, error: createError } = await supabase
          .from("settings")
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) {
          throw new Error("Failed to create default settings");
        }

        setSettings(newSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Error loading settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!settings) return;

    const { name, value, type } = e.target as HTMLInputElement;

    // Convert numeric inputs to numbers
    if (type === "number") {
      setSettings({
        ...settings,
        [name]: value === "" ? null : Number(value),
      });
    } else {
      setSettings({
        ...settings,
        [name]: value,
      });
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;

    setSettings({
      ...settings,
      theme_color: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !user) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("settings")
        .upsert({
          ...settings,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error("Failed to save settings");
      }

      setSettings(data);
      toast.success("Settings saved successfully");
      router.refresh();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit");
      return;
    }

    setIsUploading(true);
    try {
      // Create a filename with the user ID and original extension
      const fileExt = file.name.split(".").pop();
      const fileName = `logo_${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("business_assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error("Failed to upload logo");
      }

      // Get the public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("business_assets").getPublicUrl(filePath);

      // Update settings with new logo URL
      const { error: updateError } = await supabase
        .from("settings")
        .update({ logo_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) {
        throw new Error("Failed to update logo URL");
      }

      setSettings((prev) => (prev ? { ...prev, logo_url: publicUrl } : null));
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Error uploading logo");
    } finally {
      setIsUploading(false);
      // Clear the input
      e.target.value = "";
    }
  };

  const handleRemoveLogo = async () => {
    if (!settings?.logo_url || !user) return;

    if (!confirm("Are you sure you want to remove your logo?")) {
      return;
    }

    setIsUploading(true);
    try {
      // Extract the file path from the URL
      const urlParts = settings.logo_url.split("/");
      const filePath = `logos/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from("business_assets")
        .remove([filePath]);

      if (deleteError) {
        console.error("Error deleting logo file:", deleteError);
      }

      // Update settings to remove logo URL
      const { error: updateError } = await supabase
        .from("settings")
        .update({ logo_url: null })
        .eq("user_id", user.id);

      if (updateError) {
        throw new Error("Failed to update settings");
      }

      setSettings((prev) => (prev ? { ...prev, logo_url: undefined } : null));
      toast.success("Logo removed successfully");
    } catch (error) {
      console.error("Error removing logo:", error);
      toast.error("Error removing logo");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          Error loading settings. Please try again.
        </p>
        <button
          onClick={fetchSettings}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="business_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Business Name
                </label>
                <input
                  id="business_name"
                  name="business_name"
                  type="text"
                  value={settings.business_name || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="business_address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Business Address
                </label>
                <textarea
                  id="business_address"
                  name="business_address"
                  value={settings.business_address || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="business_email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Business Email
                </label>
                <input
                  id="business_email"
                  name="business_email"
                  type="email"
                  value={settings.business_email || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="business_phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Business Phone
                </label>
                <input
                  id="business_phone"
                  name="business_phone"
                  type="text"
                  value={settings.business_phone || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="tax_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tax ID / Business Number
                </label>
                <input
                  id="tax_id"
                  name="tax_id"
                  type="text"
                  value={settings.tax_id || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Logo
                </label>
                <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  {settings.logo_url ? (
                    <div className="relative w-full h-40 mb-4">
                      <Image
                        src={settings.logo_url}
                        alt="Business Logo"
                        fill
                        style={{ objectFit: "contain" }}
                        className="rounded"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-40 mb-4 bg-gray-100 rounded">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="invoice_prefix"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Invoice Number Prefix
              </label>
              <input
                id="invoice_prefix"
                name="invoice_prefix"
                type="text"
                value={settings.invoice_prefix || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="INV-"
              />
              <p className="mt-1 text-sm text-gray-500">
                Example: "INV-" will make invoice numbers like INV-1001
              </p>
            </div>

            <div>
              <label
                htmlFor="next_invoice_number"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Next Invoice Number
              </label>
              <input
                id="next_invoice_number"
                name="next_invoice_number"
                type="number"
                min="1"
                value={settings.next_invoice_number || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="default_payment_terms"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Default Payment Terms (Days)
              </label>
              <input
                id="default_payment_terms"
                name="default_payment_terms"
                type="number"
                min="0"
                value={settings.default_payment_terms || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="tax_rate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Default Tax Rate (%)
              </label>
              <input
                id="tax_rate"
                name="tax_rate"
                type="number"
                min="0"
                step="0.01"
                value={settings.tax_rate || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="footer_notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Default Invoice Notes/Footer
              </label>
              <textarea
                id="footer_notes"
                name="footer_notes"
                rows={3}
                value={settings.footer_notes || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Thank you for your business!"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Customization */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Customization</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label
              htmlFor="theme_color"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                id="theme_color"
                name="theme_color"
                type="color"
                value={settings.theme_color || "#3b82f6"}
                onChange={handleColorChange}
                className="h-10 w-10 border-none cursor-pointer rounded"
              />
              <input
                type="text"
                value={settings.theme_color || "#3b82f6"}
                onChange={handleChange}
                name="theme_color"
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              This color will be used for highlights in your invoices and
              documents.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-lg transition duration-200 ${
            isSaving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;
