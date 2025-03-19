-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';
ALTER DATABASE postgres SET "app.jwt_iss" TO 'your-jwt-issuer';

-- Users table comes from Supabase Auth

-- Extended user profile
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT,
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,
  tax_id TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create Policy for profiles
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  address TEXT,
  phone TEXT,
  default_payment_terms INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security for Clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create Policy for clients
CREATE POLICY "Users can view their own clients" 
  ON clients FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" 
  ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
  ON clients FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
  ON clients FOR DELETE USING (auth.uid() = user_id);

-- Create Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  client_id UUID REFERENCES clients(id) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security for Invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create Policy for invoices
CREATE POLICY "Users can view their own invoices" 
  ON invoices FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices" 
  ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" 
  ON invoices FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" 
  ON invoices FOR DELETE USING (auth.uid() = user_id);

-- Create Invoice Items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 2),
  amount DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security for Invoice Items
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create Policy for invoice_items (using invoice ownership as proxy)
CREATE POLICY "Users can view their own invoice items" 
  ON invoice_items FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own invoice items" 
  ON invoice_items FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own invoice items" 
  ON invoice_items FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own invoice items" 
  ON invoice_items FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
        AND invoices.user_id = auth.uid()
    )
  );

-- Create Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  invoice_prefix TEXT,
  next_invoice_number INTEGER,
  default_payment_terms INTEGER,
  tax_rate DECIMAL(5, 2),
  theme_color TEXT,
  footer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security for Settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create Policy for settings
CREATE POLICY "Users can view their own settings" 
  ON settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
  ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON settings FOR UPDATE USING (auth.uid() = user_id);

-- Create a function to automatically create a profile and settings record when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  
  INSERT INTO public.settings (user_id, invoice_prefix, next_invoice_number, default_payment_terms, tax_rate)
  VALUES (NEW.id, 'INV-', 1, 30, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile and settings on user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 