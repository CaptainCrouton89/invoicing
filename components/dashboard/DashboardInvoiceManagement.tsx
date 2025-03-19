"use client";

import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type InvoiceItem = {
  id: string;
  invoice_number: string;
  client_name: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
};

export default function DashboardInvoiceManagement() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentInvoices() {
      try {
        const response = await fetch("/api/dashboard/recent-invoices");
        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }
        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Error loading invoices");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentInvoices();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleUpdateStatus = async (invoiceId: string, newStatus: string) => {
    setIsUpdating(invoiceId);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update invoice status");
      }

      // Update the invoice status in the local state
      setInvoices((prevInvoices) =>
        prevInvoices.map((inv) =>
          inv.id === invoiceId
            ? {
                ...inv,
                status: newStatus as "draft" | "sent" | "paid" | "overdue",
              }
            : inv
        )
      );

      toast.success(`Invoice marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice status");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleSendEmail = async (invoiceId: string) => {
    // This is just a placeholder that would be connected to the actual email service
    toast.info("Email functionality will be implemented soon");
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No recent invoices found
        </p>
        <button
          onClick={() => router.push("/invoices/new")}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Create Invoice
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Invoice #
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Client
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell"
              >
                Due
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-750"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {invoice.invoice_number}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {invoice.client_name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                  {formatDate(invoice.issue_date)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                  {formatDate(invoice.due_date)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {formatCurrency(invoice.total_amount)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(invoice.status)}`}
                  >
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <div className="relative">
                      <button
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded focus:outline-none"
                        onClick={() => {
                          const dropdown = document.getElementById(
                            `dropdown-${invoice.id}`
                          );
                          if (dropdown) {
                            dropdown.classList.toggle("hidden");
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </button>
                      <div
                        id={`dropdown-${invoice.id}`}
                        className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 py-1"
                      >
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/invoices/${invoice.id}/edit`}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          Edit Invoice
                        </Link>
                        {invoice.status !== "paid" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(invoice.id, "paid")
                            }
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            disabled={isUpdating === invoice.id}
                          >
                            {isUpdating === invoice.id
                              ? "Updating..."
                              : "Mark as Paid"}
                          </button>
                        )}
                        {invoice.status !== "sent" &&
                          invoice.status !== "paid" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(invoice.id, "sent")
                              }
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                              disabled={isUpdating === invoice.id}
                            >
                              {isUpdating === invoice.id
                                ? "Updating..."
                                : "Mark as Sent"}
                            </button>
                          )}
                        <button
                          onClick={() => handleSendEmail(invoice.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          Send Email
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 text-center">
        <Link
          href="/invoices"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          View All Invoices →
        </Link>
      </div>
    </div>
  );
}
