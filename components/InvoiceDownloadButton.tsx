"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client, Invoice, InvoiceItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useRef } from "react";

type InvoiceDownloadButtonProps = {
  invoice: Invoice & {
    items: InvoiceItem[];
    clients: Client;
  };
  businessInfo: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    taxId?: string;
  };
  children?: React.ReactNode;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const InvoiceDownloadButton = ({
  invoice,
  businessInfo,
  children,
}: InvoiceDownloadButtonProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${invoice.invoice_number}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <>
      <div className="hidden">
        <div
          ref={invoiceRef}
          className="p-8 bg-white"
          style={{ width: "800px" }}
        >
          {/* Invoice Header */}
          <div className="flex justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                {businessInfo.name}
              </h1>
              {businessInfo.address && <p>{businessInfo.address}</p>}
              {businessInfo.phone && <p>Phone: {businessInfo.phone}</p>}
              {businessInfo.email && <p>Email: {businessInfo.email}</p>}
              {businessInfo.taxId && <p>Tax ID: {businessInfo.taxId}</p>}
            </div>
            <div>
              <h2 className="text-xl font-bold">INVOICE</h2>
              <p className="font-bold">#{invoice.invoice_number}</p>
              <p>Issue Date: {formatDate(invoice.issue_date)}</p>
              <p>Due Date: {formatDate(invoice.due_date)}</p>
              <p>
                Status:{" "}
                {invoice.status.charAt(0).toUpperCase() +
                  invoice.status.slice(1)}
              </p>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-2">Bill To:</h3>
            <p className="font-semibold">{invoice.clients.name}</p>
            {invoice.clients.address && <p>{invoice.clients.address}</p>}
            {invoice.clients.email && <p>Email: {invoice.clients.email}</p>}
            {invoice.clients.phone && <p>Phone: {invoice.clients.phone}</p>}
          </div>

          {/* Invoice Items */}
          <Table className="w-full mb-8 border-collapse">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="border border-gray-300 p-2 text-left">
                  Description
                </TableHead>
                <TableHead className="border border-gray-300 p-2 text-right">
                  Quantity
                </TableHead>
                <TableHead className="border border-gray-300 p-2 text-right">
                  Unit Price
                </TableHead>
                <TableHead className="border border-gray-300 p-2 text-right">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="border border-gray-300 p-2">
                    {item.description}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-right">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-right">
                    {formatCurrency(item.unit_price)}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-right">
                    {formatCurrency(item.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between mb-1">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Tax:</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Discount:</span>
                <span>{formatCurrency(invoice.discount_amount)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-gray-300">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-2">Notes:</h3>
              <p>{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm mt-16">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>

      <Button onClick={handleDownload} className="flex items-center">
        {children || (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Invoice
          </>
        )}
      </Button>
    </>
  );
};

export default InvoiceDownloadButton;
