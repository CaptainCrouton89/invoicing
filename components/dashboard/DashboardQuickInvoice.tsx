"use client";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [frequentClients, setFrequentClients] = useState<FrequentClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  useEffect(() => {
    async function fetchFrequentClients() {
      try {
        const response = await fetch("/api/clients/frequent");
        if (!response.ok) {
          throw new Error("Failed to fetch frequent clients");
        }
        const data = await response.json();
        setFrequentClients(data);

        // If there are clients, select the first one by default
        if (data.length > 0) {
          setSelectedClientId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Error loading clients");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFrequentClients();
  }, []);

  const handleCreateInvoice = async () => {
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    setIsCreating(true);

    try {
      // Create a basic invoice for the selected client
      const response = await fetch(`/api/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: selectedClientId,
          // Other fields will be filled with defaults or in the next edit screen
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      const { id } = await response.json();
      toast.success("Invoice created successfully");

      // Redirect to the invoice edit page
      router.push(`/invoices/${id}/edit`);
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
    <div className="p-4">
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

        <button
          onClick={handleCreateInvoice}
          disabled={!selectedClientId || isCreating}
          className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
            !selectedClientId || isCreating
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isCreating ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
              Creating...
            </div>
          ) : (
            "Create Invoice"
          )}
        </button>

        <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Need more options?
          </p>
          <button
            onClick={() => router.push("/invoices/new")}
            className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
          >
            Create Detailed Invoice →
          </button>
        </div>
      </div>
    </div>
  );
}
