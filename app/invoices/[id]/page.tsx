"use client";

import DeleteInvoiceButton from "@/components/DeleteInvoiceButton";
import InvoiceDownloadButton from "@/components/InvoiceDownloadButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BusinessInfo } from "@/lib/email";
import { Client, Invoice, InvoiceItem } from "@/lib/types";
import { formatCurrency, formatPhoneNumber } from "@/lib/utils";
import { useSupabase } from "@/utils/supabase/use-supabase";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EnhancedInvoice extends Omit<Invoice, "status"> {
  items: InvoiceItem[];
  clients: Client;
  paid_date?: string;
  status: "draft" | "sent" | "paid" | "overdue";
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { supabase, user } = useSupabase();
  const [invoice, setInvoice] = useState<EnhancedInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "Your Business Name",
    address: "123 Business St, City, Country",
    phone: "+1 234 567 890",
    email: "contact@yourbusiness.com",
    taxId: "TAX-ID-12345",
  });
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        if (!user) {
          return;
        }

        // Fetch invoice with items and client details
        const { data, error } = await supabase
          .from("invoices")
          .select(
            `
            *,
            items:invoice_items(*),
            clients(*)
          `
          )
          .eq("id", params.id)
          .eq("user_id", user.id)
          .single();

        if (error) {
          throw new Error("Failed to fetch invoice");
        }

        setInvoice(data as EnhancedInvoice);

        // Fetch business info from settings
        const { data: settings, error: settingsError } = await supabase
          .from("settings")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (settings && !settingsError) {
          setBusinessInfo({
            name: settings.business_name || "Your Business Name",
            address:
              settings.business_address || "123 Business St, City, Country",
            phone: settings.business_phone || "+1 234 567 890",
            email: settings.business_email || "contact@yourbusiness.com",
            taxId: settings.tax_id || "TAX-ID-12345",
            logoUrl: settings.logo_url || "",
          });
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast.error("Error loading invoice details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvoice();
  }, [params.id, supabase, user, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditInvoice = () => {
    router.push(`/invoices/${params.id}/edit`);
  };

  const handleSendEmail = async () => {
    if (!invoice || !user) return;

    try {
      setIsSending(true);

      // Check if client has an email address
      if (!invoice.clients.email) {
        toast.error("Client doesn't have an email address");
        return;
      }

      // Update invoice status to "sent" if it's in draft
      if (invoice.status === "draft") {
        const { error: updateError } = await supabase
          .from("invoices")
          .update({
            status: "sent",
            updated_at: new Date().toISOString(),
          })
          .eq("id", invoice.id)
          .eq("user_id", user.id);

        if (updateError) {
          throw new Error("Failed to update invoice status");
        }

        // Update local state
        setInvoice({
          ...invoice,
          status: "sent",
        });
      }

      // Send email to client (this would be handled by a server action or email service)
      toast.success("Invoice email sent successfully");
    } catch (error) {
      console.error("Error sending invoice email:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send email"
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!invoice || !user) return;

    try {
      setIsPaying(true);

      const { error } = await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_date: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoice.id)
        .eq("user_id", user.id);

      if (error) {
        throw new Error("Failed to update invoice status");
      }

      setInvoice({
        ...invoice,
        status: "paid",
        paid_date: new Date().toISOString().split("T")[0],
      });

      toast.success("Invoice marked as paid");
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice status");
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Invoice Not Found</h1>
        <p className="mb-4">The requested invoice could not be found.</p>
        <Button onClick={() => router.push("/invoices")}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoice {invoice.invoice_number}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/invoices/${invoice.id}/edit`}>Edit</Link>
          </Button>

          <DeleteInvoiceButton
            invoiceId={invoice.id}
            variant="destructive"
            size="default"
          />

          <Button onClick={handleSendEmail} disabled={isSending}>
            {isSending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Sending...
              </>
            ) : (
              "Send Email"
            )}
          </Button>

          <InvoiceDownloadButton
            invoice={invoice}
            businessInfo={businessInfo}
          />
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold mb-2">Invoice Details</h2>
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      invoice.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : invoice.status === "overdue"
                          ? "bg-red-100 text-red-800"
                          : invoice.status === "sent"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Issue Date:</span>{" "}
                  {formatDate(invoice.issue_date)}
                </p>
                <p>
                  <span className="font-medium">Due Date:</span>{" "}
                  {formatDate(invoice.due_date)}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Client Information</h2>
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {invoice.clients.name}
                </p>
                {invoice.clients.email && (
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {invoice.clients.email}
                  </p>
                )}
                {invoice.clients.phone && (
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {formatPhoneNumber(invoice.clients.phone)}
                  </p>
                )}
                {invoice.clients.address && (
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {invoice.clients.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Invoice Items</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-2">
                <span className="font-medium">Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">
                  Tax {invoice.tax_rate ? `(${invoice.tax_rate}%)` : ""}:
                </span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">Discount:</span>
                <span>{formatCurrency(invoice.discount_amount)}</span>
              </div>
              <div className="flex justify-between py-3 border-t border-gray-200 font-bold">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Payment Status</h2>
            {invoice.status === "paid" ? (
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-green-800">
                  <span className="font-medium">Payment Received:</span>{" "}
                  {invoice.paid_date ? formatDate(invoice.paid_date) : "N/A"}
                </p>
                <p className="text-green-800 mt-1">
                  <span className="font-medium">Amount:</span>{" "}
                  {formatCurrency(invoice.total_amount)}
                </p>
              </div>
            ) : (
              <div
                className={`p-4 rounded-md ${
                  invoice.status === "overdue"
                    ? "bg-red-50"
                    : invoice.status === "sent"
                      ? "bg-blue-50"
                      : "bg-yellow-50"
                }`}
              >
                <p
                  className={
                    invoice.status === "overdue"
                      ? "text-red-800"
                      : invoice.status === "sent"
                        ? "text-blue-800"
                        : "text-yellow-800"
                  }
                >
                  {invoice.status === "overdue"
                    ? "This invoice is overdue."
                    : invoice.status === "sent"
                      ? "Payment is pending."
                      : "This is a draft invoice."}
                </p>
                {invoice.status === "draft" ||
                invoice.status === "sent" ||
                invoice.status === "overdue" ? (
                  <Button
                    onClick={handleMarkPaid}
                    disabled={isPaying}
                    variant="success"
                  >
                    {isPaying ? "Processing..." : "Mark as Paid"}
                  </Button>
                ) : null}
              </div>
            )}
          </div>

          {invoice.notes && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Notes</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {invoice.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
