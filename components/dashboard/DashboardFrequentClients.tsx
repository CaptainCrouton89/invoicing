"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSupabase } from "@/utils/supabase/use-supabase";
import { Eye, FileEdit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type FrequentClient = {
  id: string;
  name: string;
  email: string | null;
  invoice_count: number;
  total_billed: number;
};

export default function DashboardFrequentClients() {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<FrequentClient[]>([]);

  useEffect(() => {
    async function fetchFrequentClients() {
      try {
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Get clients with invoice counts
        const { data: clientsWithInvoices, error } = await supabase
          .from("clients")
          .select(
            `
            id,
            name,
            email,
            invoices:invoices(id, total_amount)
          `
          )
          .eq("user_id", user.id);

        if (error) {
          throw new Error("Failed to fetch clients data");
        }

        // Process the data to get invoice counts and total billed
        const processedClients = clientsWithInvoices
          .map((client) => {
            const invoiceCount = client.invoices ? client.invoices.length : 0;
            const totalBilled = client.invoices
              ? client.invoices.reduce(
                  (sum: number, inv: any) => sum + (inv.total_amount || 0),
                  0
                )
              : 0;

            return {
              id: client.id,
              name: client.name,
              email: client.email,
              invoice_count: invoiceCount,
              total_billed: totalBilled,
            };
          })
          // Sort by invoice count, descending
          .sort((a, b) => b.invoice_count - a.invoice_count)
          // Take top 5
          .slice(0, 5);

        setClients(processedClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Error loading frequent clients");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFrequentClients();
  }, [supabase, user]);

  const handleCreateInvoice = (clientId: string) => {
    router.push(`/clients/${clientId}/invoices/new`);
  };

  const handleViewClient = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No frequent clients found
        </p>
        <Button onClick={() => router.push("/clients/new")} className="mt-4">
          Add Client
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 p-3">
        {clients.map((client) => (
          <Card
            key={client.id}
            className="hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700 bg-primary/5"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">{client.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {client.invoice_count}{" "}
                    {client.invoice_count === 1 ? "invoice" : "invoices"}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleViewClient(client.id)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    title="View client details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleCreateInvoice(client.id)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    title="Create invoice"
                  >
                    <FileEdit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="p-4 text-center">
        <Link
          href="/clients"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          View All Clients →
        </Link>
      </div>
    </div>
  );
}
