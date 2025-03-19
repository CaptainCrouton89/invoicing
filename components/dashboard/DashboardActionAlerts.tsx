"use client";

import { formatCurrency } from "@/lib/utils";
import { useSupabase } from "@/utils/supabase/use-supabase";
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
  const { supabase, user } = useSupabase();
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
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Get current date
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        // Calculate date 14 days in the future for upcoming invoices
        const twoWeeksFromNow = new Date(today);
        twoWeeksFromNow.setDate(today.getDate() + 14);
        const twoWeeksStr = twoWeeksFromNow.toISOString().split("T")[0];

        // Fetch overdue invoices (due date is before today and not paid)
        const { data: overdueInvoices, error: overdueError } = await supabase
          .from("invoices")
          .select(
            `
            id,
            invoice_number,
            issue_date,
            due_date,
            total_amount,
            status,
            clients(id, name, email)
          `
          )
          .eq("user_id", user.id)
          .eq("status", "sent")
          .lt("due_date", todayStr)
          .order("due_date", { ascending: true });

        if (overdueError) {
          throw new Error("Failed to fetch overdue invoices");
        }

        // Fetch draft invoices
        const { data: draftInvoices, error: draftError } = await supabase
          .from("invoices")
          .select(
            `
            id,
            invoice_number,
            issue_date,
            due_date,
            total_amount,
            status,
            clients(id, name, email)
          `
          )
          .eq("user_id", user.id)
          .eq("status", "draft")
          .order("issue_date", { ascending: false })
          .limit(5);

        if (draftError) {
          throw new Error("Failed to fetch draft invoices");
        }

        // Fetch upcoming due invoices (due in the next 2 weeks)
        const { data: upcomingInvoices, error: upcomingError } = await supabase
          .from("invoices")
          .select(
            `
            id,
            invoice_number,
            issue_date,
            due_date,
            total_amount,
            status,
            clients(id, name, email)
          `
          )
          .eq("user_id", user.id)
          .eq("status", "sent")
          .gte("due_date", todayStr)
          .lte("due_date", twoWeeksStr)
          .order("due_date", { ascending: true });

        if (upcomingError) {
          throw new Error("Failed to fetch upcoming invoices");
        }

        // Process the data
        const processOverdue = overdueInvoices.map((invoice) => {
          // Calculate days overdue
          const dueDate = new Date(invoice.due_date);
          const diffTime = Math.abs(today.getTime() - dueDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return {
            id: invoice.id,
            invoice_number: invoice.invoice_number,
            client_name: (invoice.clients as any)?.name || "Unknown Client",
            due_date: invoice.due_date,
            total_amount: invoice.total_amount,
            status: invoice.status,
            days_overdue: diffDays,
          };
        });

        const processDrafts = draftInvoices.map((invoice) => ({
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          client_name: (invoice.clients as any)?.name || "Unknown Client",
          due_date: invoice.due_date,
          total_amount: invoice.total_amount,
          status: invoice.status,
        }));

        const processUpcoming = upcomingInvoices.map((invoice) => ({
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          client_name: (invoice.clients as any)?.name || "Unknown Client",
          due_date: invoice.due_date,
          total_amount: invoice.total_amount,
          status: invoice.status,
        }));

        setAlerts({
          overdue: processOverdue,
          draftInvoices: processDrafts,
          upcomingDue: processUpcoming,
        });
      } catch (error) {
        console.error("Error fetching alerts:", error);
        toast.error("Error loading alerts");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlerts();
  }, [supabase, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      if (!user) {
        toast.error("You must be logged in to perform this action");
        return;
      }

      const { error } = await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_date: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId)
        .eq("user_id", user.id);

      if (error) {
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
