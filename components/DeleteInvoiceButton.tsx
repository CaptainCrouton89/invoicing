"use client";

import { Button } from "@/components/ui/button";
import { useSupabase } from "@/utils/supabase/use-supabase";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteInvoiceButtonProps {
  invoiceId: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onDelete?: () => void;
}

export default function DeleteInvoiceButton({
  invoiceId,
  variant = "outline",
  size = "sm",
  className = "",
  onDelete,
}: DeleteInvoiceButtonProps) {
  const { supabase, user } = useSupabase();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteInvoice = async () => {
    if (!user) {
      toast.error("You must be logged in to delete an invoice");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this invoice? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      // First, delete the invoice items
      const { error: itemsError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", invoiceId);

      if (itemsError) {
        throw new Error("Failed to delete invoice items");
      }

      // Then, delete the invoice
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoiceId)
        .eq("user_id", user.id);

      if (error) {
        throw new Error("Failed to delete invoice");
      }

      toast.success("Invoice deleted successfully");

      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete();
      } else {
        // Otherwise, refresh the page and navigate to invoices list
        router.refresh();
        router.push("/invoices");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete invoice"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDeleteInvoice}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Deleting...
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </>
      )}
    </Button>
  );
}
