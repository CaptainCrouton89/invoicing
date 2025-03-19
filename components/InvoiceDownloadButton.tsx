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
import { useRef, useState } from "react";
import { toast } from "sonner";

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
    logoUrl?: string;
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
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!invoiceRef.current) return;

    setIsLoading(true);

    try {
      // Method 1: First try using jsPDF directly
      try {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "a4",
        });

        // Define colors and styles
        const primaryColor = [59, 130, 246]; // blue-500
        const textColor = [31, 41, 55]; // gray-800
        const lightGrayColor = [243, 244, 246]; // gray-100
        const borderColor = [209, 213, 219]; // gray-300

        // Page dimensions
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 40;
        const contentWidth = pageWidth - margin * 2;

        // Set font and colors
        pdf.setFont("helvetica");
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

        // Draw header background
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, 120, "F");

        // Load and add company logo if available
        if (businessInfo.logoUrl) {
          try {
            // Use async/await to make sure logo is loaded before continuing
            await new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = "Anonymous"; // Handle CORS issues

              img.onload = () => {
                // Calculate logo dimensions maintaining aspect ratio
                const maxLogoHeight = 60;
                const maxLogoWidth = 180;

                let logoWidth = img.width;
                let logoHeight = img.height;

                // Scale down if needed while maintaining aspect ratio
                if (logoWidth > maxLogoWidth) {
                  const ratio = maxLogoWidth / logoWidth;
                  logoWidth = maxLogoWidth;
                  logoHeight = logoHeight * ratio;
                }

                if (logoHeight > maxLogoHeight) {
                  const ratio = maxLogoHeight / logoHeight;
                  logoHeight = maxLogoHeight;
                  logoWidth = logoWidth * ratio;
                }

                // Add logo to PDF
                pdf.addImage(img, "JPEG", margin, 40, logoWidth, logoHeight);

                // Adjust company header position based on logo
                resolve();
              };

              img.onerror = () => {
                console.error("Error loading logo");
                resolve(); // Continue without logo
              };

              img.src = businessInfo.logoUrl || ""; // Handle undefined case
            });

            // After logo, adjust where company name starts
            pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.setFontSize(24);
            pdf.setFont("helvetica", "bold");
            pdf.text(businessInfo.name, margin + 190, 60);
          } catch (logoError) {
            console.error("Error adding logo:", logoError);
            // Fallback to normal company header if logo fails
            pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.setFontSize(24);
            pdf.setFont("helvetica", "bold");
            pdf.text(businessInfo.name, margin, 50);
          }
        } else {
          // Company header
          pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          pdf.setFontSize(24);
          pdf.setFont("helvetica", "bold");
          pdf.text(businessInfo.name, margin, 50);
        }

        // Reset text color for regular content
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        // Company details - adjust position based on whether logo is present
        const companyStartY = businessInfo.logoUrl ? 80 : 70;
        let companyInfoY = companyStartY;

        if (businessInfo.address) {
          pdf.text(businessInfo.address, margin, companyInfoY);
          companyInfoY += 15;
        }
        if (businessInfo.email) {
          pdf.text(`Email: ${businessInfo.email}`, margin, companyInfoY);
          companyInfoY += 15;
        }
        if (businessInfo.phone) {
          pdf.text(`Phone: ${businessInfo.phone}`, margin, companyInfoY);
          companyInfoY += 15;
        }
        if (businessInfo.taxId) {
          pdf.text(`Tax ID: ${businessInfo.taxId}`, margin, companyInfoY);
        }

        // Invoice header - right aligned
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("INVOICE", pageWidth - margin, 50, { align: "right" });

        pdf.setFontSize(11);
        let invoiceInfoY = 70;

        pdf.setFont("helvetica", "bold");
        pdf.text(
          `#${invoice.invoice_number}`,
          pageWidth - margin,
          invoiceInfoY,
          {
            align: "right",
          }
        );
        invoiceInfoY += 15;

        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Issue Date: ${formatDate(invoice.issue_date)}`,
          pageWidth - margin,
          invoiceInfoY,
          {
            align: "right",
          }
        );
        invoiceInfoY += 15;

        pdf.text(
          `Due Date: ${formatDate(invoice.due_date)}`,
          pageWidth - margin,
          invoiceInfoY,
          {
            align: "right",
          }
        );
        invoiceInfoY += 15;

        const status =
          invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);

        // Status with color coding
        if (invoice.status === "paid") {
          pdf.setTextColor(34, 197, 94); // green-500
        } else if (invoice.status === "overdue") {
          pdf.setTextColor(239, 68, 68); // red-500
        } else if (invoice.status === "draft") {
          pdf.setTextColor(107, 114, 128); // gray-500
        }

        pdf.setFont("helvetica", "bold");
        pdf.text(`Status: ${status}`, pageWidth - margin, invoiceInfoY, {
          align: "right",
        });

        // Reset text color
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

        // Horizontal divider
        pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        pdf.setLineWidth(1);
        pdf.line(margin, 130, pageWidth - margin, 130);

        // Client info
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("Bill To:", margin, 155);

        pdf.setFont("helvetica", "bold");
        pdf.text(invoice.clients.name, margin, 175);

        pdf.setFont("helvetica", "normal");
        let clientInfoY = 195;
        if (invoice.clients.address) {
          const addressLines = invoice.clients.address.split("\n");
          addressLines.forEach((line) => {
            pdf.text(line, margin, clientInfoY);
            clientInfoY += 15;
          });
        } else {
          clientInfoY = 195;
        }

        if (invoice.clients.email) {
          pdf.text(`Email: ${invoice.clients.email}`, margin, clientInfoY);
          clientInfoY += 15;
        }

        if (invoice.clients.phone) {
          pdf.text(`Phone: ${invoice.clients.phone}`, margin, clientInfoY);
        }

        // Items table
        const tableTop = 240;
        const tableStartY = tableTop;
        let tableEndY = tableTop;

        // Column widths
        const colWidths = [
          contentWidth * 0.4, // Description (40%)
          contentWidth * 0.2, // Quantity (20%)
          contentWidth * 0.2, // Unit Price (20%)
          contentWidth * 0.2, // Amount (20%)
        ];

        // Calculate column positions
        const colPositions = [margin];
        for (let i = 1; i < colWidths.length; i++) {
          colPositions.push(colPositions[i - 1] + colWidths[i - 1]);
        }

        // Table rows
        let rowY = tableTop + 30;
        const rowHeight = 30;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);

        // Calculate available height for table rows on first page
        const firstPageMaxY = pageHeight - 50; // Leave room for footer
        let availableHeight = firstPageMaxY - rowY;
        let currentPage = 1;

        // Add footer to all pages function
        const addFooter = (pageNum: number) => {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(107, 114, 128); // gray-500

          // Add page number
          pdf.text(`Page ${pageNum}`, margin, pageHeight - 20);

          // Thank you message
          pdf.text(
            "Thank you for your business!",
            pageWidth / 2,
            pageHeight - 30,
            { align: "center" }
          );

          // Invoice number on each page for reference
          pdf.text(
            `Invoice #${invoice.invoice_number}`,
            pageWidth - margin,
            pageHeight - 20,
            { align: "right" }
          );
        };

        // Draw table header row function
        const addTableHeader = (startY: number) => {
          // Table headers - colored background
          pdf.setFillColor(
            lightGrayColor[0],
            lightGrayColor[1],
            lightGrayColor[2]
          );
          pdf.rect(margin, startY, contentWidth, 30, "F");

          // Draw table border
          pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
          pdf.setLineWidth(0.5);

          // Draw outer table border
          pdf.rect(margin, startY, contentWidth, 30);

          // Draw vertical lines for header
          for (let i = 1; i < colPositions.length; i++) {
            pdf.line(colPositions[i], startY, colPositions[i], startY + 30);
          }

          // Headers text
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(11);
          pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

          const headers = ["Description", "Quantity", "Unit Price", "Amount"];
          headers.forEach((header, i) => {
            if (i === 0) {
              pdf.text(header, colPositions[i] + 10, startY + 20);
            } else {
              const textWidth = pdf.getTextWidth(header);
              pdf.text(
                header,
                colPositions[i] + colWidths[i] - textWidth - 10,
                startY + 20
              );
            }
          });

          return startY + 30;
        };

        invoice.items.forEach((item, index) => {
          // Check if we need a new page
          if (rowY + rowHeight > firstPageMaxY) {
            // Add footer to current page
            addFooter(currentPage);

            // Add a new page
            pdf.addPage();
            currentPage++;

            // Reset rowY for new page and add header
            rowY = margin + 40; // Start lower on continuation pages to add mini-header

            // Add mini header with invoice/client info
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text(
              `Invoice #${invoice.invoice_number} (continued)`,
              margin,
              margin
            );
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text(`${invoice.clients.name}`, margin, margin + 15);

            // Add table header
            rowY = addTableHeader(rowY + 20);

            // Reset available height for new page
            availableHeight = pageHeight - 50 - rowY;
          }

          // Draw row borders
          pdf.rect(margin, rowY, contentWidth, rowHeight);

          // Draw vertical lines for cells
          for (let i = 1; i < colPositions.length; i++) {
            pdf.line(colPositions[i], rowY, colPositions[i], rowY + rowHeight);
          }

          // Add zebra striping for better readability
          if (index % 2 === 1) {
            pdf.setFillColor(252, 252, 252);
            pdf.rect(margin, rowY, contentWidth, rowHeight, "F");
          }

          // Cell content
          pdf.text(item.description, colPositions[0] + 10, rowY + 20);

          // Right align numbers
          pdf.text(
            item.quantity.toString(),
            colPositions[1] +
              colWidths[1] -
              pdf.getTextWidth(item.quantity.toString()) -
              10,
            rowY + 20
          );

          pdf.text(
            formatCurrency(item.unit_price),
            colPositions[2] +
              colWidths[2] -
              pdf.getTextWidth(formatCurrency(item.unit_price)) -
              10,
            rowY + 20
          );

          pdf.text(
            formatCurrency(item.amount),
            colPositions[3] +
              colWidths[3] -
              pdf.getTextWidth(formatCurrency(item.amount)) -
              10,
            rowY + 20
          );

          rowY += rowHeight;
        });

        tableEndY = rowY;

        // Check if we need a new page for totals section
        const totalsHeight = 200; // Approximate height needed for totals, notes, etc.

        if (tableEndY + totalsHeight > firstPageMaxY) {
          // Add footer to current page
          addFooter(currentPage);

          // Add a new page
          pdf.addPage();
          currentPage++;

          // Reset position for new page
          tableEndY = margin + 40;
        }

        // Totals section - right aligned with borders
        const totalsWidth = 200;
        const totalsX = pageWidth - margin - totalsWidth;
        let totalsY = tableEndY + 20;

        // Draw totals container
        pdf.setFillColor(255, 255, 255);
        pdf.rect(totalsX, totalsY, totalsWidth, 90, "F");
        pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        pdf.rect(totalsX, totalsY, totalsWidth, 90);

        // Draw horizontal lines between total rows
        pdf.line(totalsX, totalsY + 30, totalsX + totalsWidth, totalsY + 30);
        pdf.line(totalsX, totalsY + 60, totalsX + totalsWidth, totalsY + 60);

        // Totals content
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);

        // Subtotal
        pdf.text("Subtotal:", totalsX + 20, totalsY + 20);
        pdf.text(
          formatCurrency(invoice.subtotal),
          totalsX + totalsWidth - 20,
          totalsY + 20,
          { align: "right" }
        );

        // Tax
        pdf.text("Tax:", totalsX + 20, totalsY + 50);
        pdf.text(
          formatCurrency(invoice.tax_amount),
          totalsX + totalsWidth - 20,
          totalsY + 50,
          { align: "right" }
        );

        // Discount
        pdf.text("Discount:", totalsX + 20, totalsY + 80);
        pdf.text(
          formatCurrency(invoice.discount_amount),
          totalsX + totalsWidth - 20,
          totalsY + 80,
          { align: "right" }
        );

        // Grand total with background
        totalsY += 90;
        pdf.setFillColor(
          lightGrayColor[0],
          lightGrayColor[1],
          lightGrayColor[2]
        );
        pdf.rect(totalsX, totalsY, totalsWidth, 30, "F");
        pdf.rect(totalsX, totalsY, totalsWidth, 30);

        pdf.setFont("helvetica", "bold");
        pdf.text("Total:", totalsX + 20, totalsY + 20);
        pdf.text(
          formatCurrency(invoice.total_amount),
          totalsX + totalsWidth - 20,
          totalsY + 20,
          { align: "right" }
        );

        // Notes section if exists
        if (invoice.notes) {
          const notesY = totalsY + 60;

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.text("Notes:", margin, notesY);

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);

          const splitNotes = pdf.splitTextToSize(invoice.notes, contentWidth);
          pdf.text(splitNotes, margin, notesY + 20);
        }

        // Add footer to the final page
        addFooter(currentPage);

        pdf.save(`Invoice-${invoice.invoice_number}.pdf`);
        toast.success("Invoice downloaded successfully");
        setIsLoading(false);
        return;
      } catch (directError) {
        console.error(
          "Error with direct PDF generation, trying canvas method:",
          directError
        );
        // Continue to html2canvas method as fallback
      }

      // Method 2: Fallback to html2canvas method
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 10000,
        backgroundColor: "#FFFFFF",
        onclone: (clonedDoc) => {
          Array.from(clonedDoc.images).forEach((img: HTMLImageElement) => {
            img.crossOrigin = "anonymous";
          });
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${invoice.invoice_number}.pdf`);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(
        "There was an error generating the PDF. Please try again or contact support."
      );
    } finally {
      setIsLoading(false);
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

      <Button
        onClick={handleDownload}
        className="flex items-center"
        disabled={isLoading}
      >
        {isLoading ? (
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
            Generating...
          </>
        ) : (
          children || (
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
          )
        )}
      </Button>
    </>
  );
};

export default InvoiceDownloadButton;
