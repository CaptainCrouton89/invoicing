"use client";

import { Database } from "@/lib/database.types";
import { formatCurrency, formatPhoneNumber } from "@/lib/utils";
import {
  Document,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";

// Define styles using Tailwind classes
const tw = createTw({
  theme: {
    fontFamily: {
      sans: ["Helvetica", "Arial", "sans-serif"],
    },
    extend: {
      colors: {
        primary: "#3b82f6",
      },
    },
  },
});

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 50,
  },
  companyInfo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#3b82f6",
  },
  section: {
    marginBottom: 10,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontWeight: "bold",
    fontSize: 10,
  },
  tableCell: {
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#6b7280",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  infoLabel: {
    width: 100,
    fontWeight: "bold",
  },
  infoValue: {
    flex: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  totalLabel: {
    width: 100,
    fontWeight: "bold",
    textAlign: "right",
    marginRight: 10,
  },
  totalValue: {
    width: 100,
    textAlign: "right",
  },
  bold: {
    fontWeight: "bold",
  },
});

type InvoicePDFProps = {
  invoice: Database["public"]["Tables"]["invoices"]["Row"] & {
    items: Database["public"]["Tables"]["invoice_items"]["Row"][];
    clients: Database["public"]["Tables"]["clients"]["Row"];
  };
  businessInfo: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    taxId?: string;
  };
  logoUrl?: string;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const InvoicePDF = ({ invoice, businessInfo, logoUrl }: InvoicePDFProps) => {
  return (
    <PDFViewer className="w-full h-screen">
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{businessInfo.name}</Text>
              {businessInfo.address && <Text>{businessInfo.address}</Text>}
              {businessInfo.phone && (
                <Text>Phone: {formatPhoneNumber(businessInfo.phone)}</Text>
              )}
              {businessInfo.email && <Text>Email: {businessInfo.email}</Text>}
              {businessInfo.taxId && <Text>Tax ID: {businessInfo.taxId}</Text>}
            </View>
            {logoUrl && (
              <View>
                {/* Logo would go here but react-pdf doesn't easily support dynamic images */}
                <Text>Company Logo</Text>
              </View>
            )}
          </View>

          {/* Invoice Info */}
          <View style={styles.section}>
            <Text style={styles.bold}>INVOICE #{invoice.invoice_number}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Issue Date:</Text>
              <Text style={styles.infoValue}>
                {formatDate(invoice.issue_date)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Due Date:</Text>
              <Text style={styles.infoValue}>
                {formatDate(invoice.due_date)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={styles.infoValue}>
                {invoice.status.charAt(0).toUpperCase() +
                  invoice.status.slice(1)}
              </Text>
            </View>
          </View>

          {/* Client Info */}
          <View style={styles.section}>
            <Text style={styles.bold}>BILL TO:</Text>
            <Text>{invoice.clients.name}</Text>
            {invoice.clients.address && <Text>{invoice.clients.address}</Text>}
            {invoice.clients.email && (
              <Text>Email: {invoice.clients.email}</Text>
            )}
            {invoice.clients.phone && (
              <Text>Phone: {formatPhoneNumber(invoice.clients.phone)}</Text>
            )}
          </View>

          {/* Invoice Items */}
          <View style={styles.section}>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableRow}>
                <View style={[styles.tableColHeader, { width: "40%" }]}>
                  <Text style={styles.tableCellHeader}>Description</Text>
                </View>
                <View style={[styles.tableColHeader, { width: "20%" }]}>
                  <Text style={styles.tableCellHeader}>Quantity</Text>
                </View>
                <View style={[styles.tableColHeader, { width: "20%" }]}>
                  <Text style={styles.tableCellHeader}>Unit Price</Text>
                </View>
                <View style={[styles.tableColHeader, { width: "20%" }]}>
                  <Text style={styles.tableCellHeader}>Amount</Text>
                </View>
              </View>

              {/* Table Body */}
              {invoice.items.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: "40%" }]}>
                    <Text style={styles.tableCell}>{item.description}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: "20%" }]}>
                    <Text style={styles.tableCell}>{item.quantity}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: "20%" }]}>
                    <Text style={styles.tableCell}>
                      {formatCurrency(item.unit_price)}
                    </Text>
                  </View>
                  <View style={[styles.tableCol, { width: "20%" }]}>
                    <Text style={styles.tableCell}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Totals */}
            <View style={{ marginTop: 10 }}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(invoice.subtotal)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(invoice.tax_amount)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(invoice.discount_amount)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, styles.bold]}>Total:</Text>
                <Text style={[styles.totalValue, styles.bold]}>
                  {formatCurrency(invoice.total_amount)}
                </Text>
              </View>
            </View>
          </View>

          {/* Notes */}
          {invoice.notes && (
            <View style={styles.section}>
              <Text style={styles.bold}>Notes:</Text>
              <Text>{invoice.notes}</Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text>Thank you for your business!</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default InvoicePDF;
