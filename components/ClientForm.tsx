"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Client } from "@/lib/types";
import { useSupabase } from "@/utils/supabase/use-supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type FormMode = "create" | "edit";

interface ClientFormProps {
  client?: Client;
  mode: FormMode;
}

export default function ClientForm({ client, mode }: ClientFormProps) {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>(
    client || {
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      default_payment_terms: 30,
      notes: "",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : parseInt(value, 10),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to perform this action");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        // Add user_id to the client data
        const clientData = {
          ...formData,
          user_id: user.id,
        };

        const { data, error } = await supabase
          .from("clients")
          .insert(clientData)
          .select()
          .single();

        if (error) {
          throw new Error(error.message || "Failed to create client");
        }

        toast.success("Client created successfully");
      } else {
        // Update existing client
        const { error } = await supabase
          .from("clients")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", client?.id)
          .eq("user_id", user.id);

        if (error) {
          throw new Error(error.message || "Failed to update client");
        }

        toast.success("Client updated successfully");
      }

      router.push("/clients");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">
            Client Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name || ""}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            name="contact_person"
            type="text"
            value={formData.contact_person || ""}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email || ""}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="text"
            value={formData.phone || ""}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            rows={3}
            value={formData.address || ""}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="default_payment_terms">
            Default Payment Terms (days)
          </Label>
          <Input
            id="default_payment_terms"
            name="default_payment_terms"
            type="number"
            min="0"
            value={formData.default_payment_terms || ""}
            onChange={handleNumberChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes || ""}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3">
        <Button type="button" onClick={() => router.back()} variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} variant="default">
          {isSubmitting
            ? "Saving..."
            : mode === "create"
              ? "Create Client"
              : "Update Client"}
        </Button>
      </div>
    </form>
  );
}
