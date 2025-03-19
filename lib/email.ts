import { Resend } from "resend";
import { Client, Invoice, InvoiceItem } from "./types";
import { formatCurrency } from "./utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export type BusinessInfo = {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  logoUrl?: string;
};

export const sendInvoiceEmail = async (
  invoice: Invoice & { items: InvoiceItem[]; clients: Client },
  businessInfo: BusinessInfo,
  recipientEmail?: string
) => {
  try {
    const recipient = recipientEmail || invoice.clients.email;

    if (!recipient) {
      throw new Error("No recipient email address provided");
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const tableRows = invoice.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.description}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.unit_price)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.amount)}</td>
      </tr>
    `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .invoice-info {
            margin-bottom: 20px;
          }
          .invoice-details, .client-details {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #f2f2f2;
            text-align: left;
            padding: 8px;
            border: 1px solid #ddd;
          }
          td {
            padding: 8px;
            border: 1px solid #ddd;
          }
          .totals {
            width: 50%;
            margin-left: auto;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #777;
          }
          .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${businessInfo.name}</h2>
            ${businessInfo.address ? `<p>${businessInfo.address}</p>` : ""}
            ${businessInfo.email ? `<p>Email: ${businessInfo.email}</p>` : ""}
            ${businessInfo.phone ? `<p>Phone: ${businessInfo.phone}</p>` : ""}
          </div>
          
          <div class="invoice-info">
            <h2>INVOICE #${invoice.invoice_number}</h2>
            <p><strong>Issue Date:</strong> ${formatDate(invoice.issue_date)}</p>
            <p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
            <p><strong>Status:</strong> ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</p>
          </div>
          
          <div class="client-details">
            <h3>Bill To:</h3>
            <p><strong>${invoice.clients.name}</strong></p>
            ${invoice.clients.address ? `<p>${invoice.clients.address}</p>` : ""}
            ${invoice.clients.email ? `<p>Email: ${invoice.clients.email}</p>` : ""}
            ${invoice.clients.phone ? `<p>Phone: ${invoice.clients.phone}</p>` : ""}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right">Quantity</th>
                <th style="text-align: right">Unit Price</th>
                <th style="text-align: right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          
          <div class="totals">
            <p><strong>Subtotal:</strong> ${formatCurrency(invoice.subtotal)}</p>
            <p><strong>Tax${invoice.tax_rate ? ` (${invoice.tax_rate}%)` : ""}:</strong> ${formatCurrency(invoice.tax_amount)}</p>
            <p><strong>Discount:</strong> ${formatCurrency(invoice.discount_amount)}</p>
            <p><strong>Total:</strong> ${formatCurrency(invoice.total_amount)}</p>
          </div>
          
          ${
            invoice.notes
              ? `
          <div class="notes">
            <h3>Notes:</h3>
            <p>${invoice.notes}</p>
          </div>
          `
              : ""
          }
          
          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: `${businessInfo.name} <${process.env.EMAIL_FROM || "invoicing@example.com"}>`,
      to: [recipient],
      subject: `Invoice #${invoice.invoice_number} from ${businessInfo.name}`,
      html: emailHtml,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error sending email",
    };
  }
};
