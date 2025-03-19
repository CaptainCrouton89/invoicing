import { Resend } from "resend";
import { Client, Invoice, InvoiceItem } from "./types";
import { formatCurrency, formatPhoneNumber } from "./utils";

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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.5;
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
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
            margin-bottom: 20px;
          }
          .invoice-info {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 4px;
          }
          .client-details {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          table th, table td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          table th {
            background-color: #f2f2f2;
            text-align: left;
          }
          .totals {
            margin-top: 20px;
            text-align: right;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #777;
            font-size: 12px;
          }
          .cta {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4f46e5;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          }
          h2 {
            color: #4f46e5;
          }
          .company-details {
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invoice from ${businessInfo.name}</h1>
            <p>Invoice #${invoice.invoice_number}</p>
          </div>
          
          <p>Hello${invoice.clients.contact_person ? ` ${invoice.clients.contact_person}` : ""},</p>
          
          <p>I'm sending you the invoice #${invoice.invoice_number} for ${formatCurrency(invoice.total_amount)}.</p>
          
          <div class="company-details">
            <h3>${businessInfo.name}</h3>
            ${businessInfo.address ? `<p>${businessInfo.address}</p>` : ""}
            ${businessInfo.email ? `<p>Email: ${businessInfo.email}</p>` : ""}
            ${businessInfo.phone ? `<p>Phone: ${formatPhoneNumber(businessInfo.phone)}</p>` : ""}
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
            ${invoice.clients.phone ? `<p>Phone: ${formatPhoneNumber(invoice.clients.phone)}</p>` : ""}
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
