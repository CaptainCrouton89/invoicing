"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSupabase } from "@/utils/supabase/use-supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type FrequentClient = {
  id: string;
  name: string;
  email?: string;
  default_items?: {
    description: string;
    quantity: number;
    unit_price: number;
  }[];
};

export default function DashboardQuickInvoice() {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [frequentClients, setFrequentClients] = useState<FrequentClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  useEffect(() => {
    async function fetchFrequentClients() {
      try {
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Get clients with invoice counts to find frequent clients
        const { data: clientsWithInvoices, error } = await supabase
          .from("clients")
          .select(
            `
            id,
            name,
            email,
            invoices:invoices(id)
          `
          )
          .eq("user_id", user.id);

        if (error) {
          throw new Error("Failed to fetch clients data");
        }

        // Process the data to get clients with the most invoices
        const processedClients = clientsWithInvoices
          .map((client) => ({
            id: client.id,
            name: client.name,
            email: client.email,
            invoice_count: client.invoices ? client.invoices.length : 0,
          }))
          // Sort by invoice count, descending
          .sort((a, b) => b.invoice_count - a.invoice_count)
          // Take top 5
          .slice(0, 5);

        setFrequentClients(processedClients);

        // If there are clients, select the first one by default
        if (processedClients.length > 0) {
          setSelectedClientId(processedClients[0].id);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Error loading clients");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFrequentClients();
  }, [supabase, user]);

  const handleCreateInvoice = async () => {
    if (!selectedClientId || !user) {
      toast.error("Please select a client");
      return;
    }

    setIsCreating(true);

    try {
      // Get settings for invoice prefix and next number
      const { data: settings, error: settingsError } = await supabase
        .from("settings")
        .select("invoice_prefix, next_invoice_number")
        .eq("user_id", user.id)
        .single();

      if (settingsError && settingsError.code !== "PGRST116") {
        throw new Error("Failed to retrieve settings");
      }

      // Generate invoice number
      const invoicePrefix = settings?.invoice_prefix || "INV-";
      const nextInvoiceNumber = settings?.next_invoice_number || 1001;
      const invoiceNumber = `${invoicePrefix}${String(nextInvoiceNumber).padStart(4, "0")}`;

      // Get current date for issue date
      const today = new Date();
      const issueDate = today.toISOString().split("T")[0];

      // Calculate due date (default 30 days)
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + 30);
      const dueDateStr = dueDate.toISOString().split("T")[0];

      // Create basic invoice with minimal data
      const { data: invoice, error } = await supabase
        .from("invoices")
        .insert({
          user_id: user.id,
          client_id: selectedClientId,
          invoice_number: invoiceNumber,
          issue_date: issueDate,
          due_date: dueDateStr,
          status: "draft",
          total_amount: 0,
        })
        .select()
        .single();

      if (error) {
        throw new Error("Failed to create invoice");
      }

      // Update next invoice number in settings
      if (settings) {
        await supabase
          .from("settings")
          .update({ next_invoice_number: nextInvoiceNumber + 1 })
          .eq("user_id", user.id);
      }

      toast.success("Draft invoice created successfully");

      // Redirect to the invoice edit page
      router.push(`/invoices/${invoice.id}/edit`);
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (frequentClients.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No clients found</p>
        <p className="text-sm mt-2 text-gray-400 dark:text-gray-500">
          Add clients to enable quick invoicing
        </p>
        <button
          onClick={() => router.push("/clients/new")}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Add Client
        </button>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Quick Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="clientSelect"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Select Client
            </label>
            <select
              id="clientSelect"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isCreating}
            >
              <option value="" disabled>
                Select a client
              </option>
              {frequentClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleCreateInvoice}
            disabled={!selectedClientId || isCreating}
            className="w-full"
            variant={!selectedClientId || isCreating ? "secondary" : "default"}
          >
            {isCreating ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Creating...
              </div>
            ) : (
              "Create Invoice"
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Need more options?
        </p>
        <button
          onClick={() => router.push("/invoices/new")}
          className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
        >
          Create Detailed Invoice →
        </button>
      </CardFooter>
    </Card>
  );
}
