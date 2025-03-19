export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          city: string;
          state: string;
          zip: string;
          country: string;
          notes: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string;
          address?: string;
          city?: string;
          state?: string;
          zip?: string;
          country?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          address?: string;
          city?: string;
          state?: string;
          zip?: string;
          country?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          issue_date: string;
          due_date: string;
          paid_date: string | null;
          client_id: string;
          total_amount: number;
          status: string;
          notes: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          issue_date: string;
          due_date: string;
          paid_date?: string | null;
          client_id: string;
          total_amount: number;
          status: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          issue_date?: string;
          due_date?: string;
          paid_date?: string | null;
          client_id?: string;
          total_amount?: number;
          status?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          business_address: string;
          business_phone: string;
          business_email: string;
          tax_id: string;
          logo_url: string;
          invoice_prefix: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          business_address?: string;
          business_phone?: string;
          business_email?: string;
          tax_id?: string;
          logo_url?: string;
          invoice_prefix?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          business_address?: string;
          business_phone?: string;
          business_email?: string;
          tax_id?: string;
          logo_url?: string;
          invoice_prefix?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
