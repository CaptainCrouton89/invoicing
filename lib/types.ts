export interface User {
  id: string;
  email: string;
  created_at: string;
  business_name?: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  tax_id?: string;
  logo_url?: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  address?: string;
  phone?: string;
  default_payment_terms?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  client_id: string;
  issue_date: string;
  due_date: string;
  status: "draft" | "sent" | "paid" | "overdue";
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  amount: number;
  discount?: number;
  created_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  invoice_prefix?: string;
  next_invoice_number?: number;
  default_payment_terms?: number;
  tax_rate?: number;
  theme_color?: string;
  footer_notes?: string;
  created_at: string;
  updated_at?: string;
}

export type InvoiceWithItems = Invoice & {
  items: InvoiceItem[];
  client: Client;
};

export type ClientWithInvoices = Client & {
  invoices: Invoice[];
};
