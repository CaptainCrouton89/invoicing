"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { useSupabase } from "@/utils/supabase/use-supabase";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const { supabase, user } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentInvoices() {
      try {
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: recentInvoices, error } = await supabase
          .from("invoices")
          .select(
            `
            id,
            invoice_number,
            issue_date,
            due_date,
            total_amount,
            status,
            clients(id, name)
          `
          )
          .eq("user_id", user.id)
          .order("issue_date", { ascending: false })
          .limit(5);

        if (error) {
          throw new Error("Failed to fetch invoices");
        }

        // Process the data
        const processedInvoices = recentInvoices.map((invoice) => ({
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          client_name: (invoice.clients as any)?.name || "Unknown Client",
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          total_amount: invoice.total_amount,
          status: invoice.status as "draft" | "sent" | "paid" | "overdue",
        }));

        setInvoices(processedInvoices);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load recent invoices");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentInvoices();
  }, [supabase, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleUpdateStatus = async (invoiceId: string, newStatus: string) => {
    try {
      setIsUpdating(invoiceId);

      if (!user) {
        toast.error("You must be logged in to perform this action");
        return;
      }

      // Get the current date for 'paid_date' if status is being set to 'paid'
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === "paid") {
        updateData.paid_date = new Date().toISOString().split("T")[0];
      }

      const { error } = await supabase
        .from("invoices")
        .update(updateData)
        .eq("id", invoiceId)
        .eq("user_id", user.id);

      if (error) {
        throw new Error("Failed to update invoice status");
      }

      // Update the local state
      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice) =>
          invoice.id === invoiceId
            ? { ...invoice, status: newStatus as any }
            : invoice
        )
      );

      toast.success(`Invoice status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating invoice status:", error);
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
        <Button onClick={() => router.push("/invoices/new")} className="mt-4">
          Create Invoice
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="hidden sm:table-cell">Due</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-750"
              >
                <TableCell className="font-medium">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {invoice.invoice_number}
                  </Link>
                </TableCell>
                <TableCell>{invoice.client_name}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatDate(invoice.issue_date)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatDate(invoice.due_date)}
                </TableCell>
                <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(invoice.status)}`}
                  >
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-32 px-1 py-0" align="end">
                      <div className="flex flex-col py-1">
                        <Button variant="ghost" size="sm">
                          <Link href={`/invoices/${invoice.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Link href={`/invoices/${invoice.id}/edit`}>
                            Edit Invoice
                          </Link>
                        </Button>
                        {invoice.status !== "paid" && (
                          <Button
                            onClick={() =>
                              handleUpdateStatus(invoice.id, "paid")
                            }
                            variant="ghost"
                            size="sm"
                            disabled={isUpdating === invoice.id}
                          >
                            {isUpdating === invoice.id
                              ? "Updating..."
                              : "Mark as Paid"}
                          </Button>
                        )}
                        {invoice.status !== "sent" &&
                          invoice.status !== "paid" && (
                            <Button
                              onClick={() =>
                                handleUpdateStatus(invoice.id, "sent")
                              }
                              variant="ghost"
                              size="sm"
                              disabled={isUpdating === invoice.id}
                            >
                              {isUpdating === invoice.id
                                ? "Updating..."
                                : "Mark as Sent"}
                            </Button>
                          )}
                        <Button
                          onClick={() => handleSendEmail(invoice.id)}
                          variant="ghost"
                          size="sm"
                        >
                          Send Email
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
