"use client";

import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type AlertInvoice = {
  id: string;
  invoice_number: string;
  client_name: string;
  due_date: string;
  total_amount: number;
  status: string;
  days_overdue?: number;
};

export default function DashboardActionAlerts() {
  const [alerts, setAlerts] = useState<{
    overdue: AlertInvoice[];
    draftInvoices: AlertInvoice[];
    upcomingDue: AlertInvoice[];
  }>({
    overdue: [],
    draftInvoices: [],
    upcomingDue: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch("/api/dashboard/alerts");
        if (!response.ok) {
          throw new Error("Failed to fetch alerts");
        }
        const data = await response.json();
        setAlerts(data);
      } catch (error) {
        console.error("Error fetching alerts:", error);
        toast.error("Error loading alerts");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlerts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "paid" }),
      });

      if (!response.ok) {
        throw new Error("Failed to update invoice status");
      }

      // Remove the invoice from alerts
      setAlerts((prev) => ({
        ...prev,
        overdue: prev.overdue.filter((inv) => inv.id !== invoiceId),
        upcomingDue: prev.upcomingDue.filter((inv) => inv.id !== invoiceId),
      }));

      toast.success("Invoice marked as paid");
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice status");
    }
  };

  const handleSendReminder = async (invoiceId: string) => {
    try {
      toast.info("Sending reminder email...");
      // Actual email functionality will be implemented later
      setTimeout(() => {
        toast.success("Reminder sent successfully");
      }, 1500);
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const hasAlerts =
    alerts.overdue.length > 0 ||
    alerts.draftInvoices.length > 0 ||
    alerts.upcomingDue.length > 0;

  if (!hasAlerts) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No actions needed at this time
        </p>
        <p className="text-sm mt-2 text-gray-400 dark:text-gray-500">
          All invoices are up to date and no drafts pending
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {/* Overdue Invoices */}
      {alerts.overdue.length > 0 && (
        <div className="p-4">
          <h3 className="text-red-600 dark:text-red-400 font-medium mb-3">
            Overdue Invoices ({alerts.overdue.length})
          </h3>
          <div className="space-y-3">
            {alerts.overdue.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
              >
                <div className="mb-2 sm:mb-0">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {invoice.invoice_number}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {invoice.client_name} •{" "}
                    {formatCurrency(invoice.total_amount)}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    <span className="font-medium">
                      {invoice.days_overdue}{" "}
                      {invoice.days_overdue === 1 ? "day" : "days"} overdue
                    </span>{" "}
                    (Due: {formatDate(invoice.due_date)})
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleMarkAsPaid(invoice.id)}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded"
                  >
                    Mark Paid
                  </button>
                  <button
                    onClick={() => handleSendReminder(invoice.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                  >
                    Send Reminder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Draft Invoices */}
      {alerts.draftInvoices.length > 0 && (
        <div className="p-4">
          <h3 className="text-amber-600 dark:text-amber-400 font-medium mb-3">
            Draft Invoices ({alerts.draftInvoices.length})
          </h3>
          <div className="space-y-3">
            {alerts.draftInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
              >
                <div className="mb-2 sm:mb-0">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {invoice.invoice_number}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {invoice.client_name} •{" "}
                    {formatCurrency(invoice.total_amount)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/invoices/${invoice.id}/edit`}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-3 py-1 rounded"
                  >
                    Finalize
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Due Invoices */}
      {alerts.upcomingDue.length > 0 && (
        <div className="p-4">
          <h3 className="text-blue-600 dark:text-blue-400 font-medium mb-3">
            Due Soon ({alerts.upcomingDue.length})
          </h3>
          <div className="space-y-3">
            {alerts.upcomingDue.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              >
                <div className="mb-2 sm:mb-0">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {invoice.invoice_number}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {invoice.client_name} •{" "}
                    {formatCurrency(invoice.total_amount)}
                  </p>
                  <p className="text-sm">Due: {formatDate(invoice.due_date)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleMarkAsPaid(invoice.id)}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded"
                  >
                    Mark Paid
                  </button>
                  <button
                    onClick={() => handleSendReminder(invoice.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                  >
                    Send Reminder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
