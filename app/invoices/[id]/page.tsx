"use client";

import InvoiceDownloadButton from "@/components/InvoiceDownloadButton";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessInfo } from "@/lib/email";
import { Client, Invoice, InvoiceItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<
    (Invoice & { items: InvoiceItem[]; clients: Client }) | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "Your Business Name",
    address: "123 Business St, City, Country",
    phone: "+1 234 567 890",
    email: "contact@yourbusiness.com",
    taxId: "TAX-ID-12345",
  });

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const response = await fetch(`/api/invoices/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch invoice");
        }
        const data = await response.json();
        setInvoice(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast.error("Error loading invoice details");
      } finally {
        setIsLoading(false);
      }
    }

    // Todo: Fetch actual business info from settings in the future
    fetchInvoice();
  }, [params.id]);

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
    if (!invoice) return;

    try {
      setIsSending(true);

      // Check if client has an email address
      if (!invoice.clients.email) {
        toast.error("Client doesn't have an email address");
        return;
      }

      const response = await fetch(`/api/invoices/${params.id}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessInfo,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send email");
      }

      toast.success("Invoice email sent successfully");

      // If invoice was in draft status, refresh to show updated status
      if (invoice.status === "draft") {
        const invoiceResponse = await fetch(`/api/invoices/${params.id}`);
        if (invoiceResponse.ok) {
          const updatedInvoice = await invoiceResponse.json();
          setInvoice(updatedInvoice);
        }
      }
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
    if (!invoice) return;

    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "paid" }),
      });

      if (!response.ok) {
        throw new Error("Failed to update invoice status");
      }

      setInvoice({
        ...invoice,
        status: "paid",
      });

      toast.success("Invoice marked as paid");
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice status");
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
        <button
          onClick={() => router.push("/invoices")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoice {invoice.invoice_number}</h1>
        <div className="flex space-x-2">
          <Link
            href={`/invoices/${invoice.id}/edit`}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md flex items-center"
          >
            <span>Edit</span>
          </Link>
          <button
            onClick={handleSendEmail}
            disabled={isSending}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center ${
              isSending ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
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
          </button>

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
                    {invoice.clients.phone}
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
            <table className="min-w-full divide-y divide-gray-200 mb-6">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                {invoice.status !== "draft" && (
                  <button
                    onClick={handleMarkPaid}
                    disabled={isMarkingPaid}
                    className={`mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md ${
                      isMarkingPaid ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isMarkingPaid ? "Processing..." : "Mark as Paid"}
                  </button>
                )}
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
