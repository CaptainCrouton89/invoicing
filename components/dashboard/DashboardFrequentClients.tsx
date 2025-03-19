"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type FrequentClient = {
  id: string;
  name: string;
  email: string;
  invoice_count: number;
  total_billed: number;
};

export default function DashboardFrequentClients() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<FrequentClient[]>([]);

  useEffect(() => {
    async function fetchFrequentClients() {
      try {
        const response = await fetch("/api/clients/frequent");
        if (!response.ok) {
          throw new Error("Failed to fetch frequent clients");
        }
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Error loading frequent clients");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFrequentClients();
  }, []);

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
    <div>
      <div className="grid grid-cols-1 gap-3 p-3">
        {clients.map((client) => (
          <div
            key={client.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {client.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {client.invoice_count}{" "}
                  {client.invoice_count === 1 ? "invoice" : "invoices"}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewClient(client.id)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded"
                  title="View client details"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleCreateInvoice(client.id)}
                  className="p-1.5 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 rounded"
                  title="Create new invoice"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
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
