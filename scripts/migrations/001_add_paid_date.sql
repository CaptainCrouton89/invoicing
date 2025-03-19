-- Migration: Add paid_date column and automatic trigger to invoices table

-- First add the paid_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'paid_date'
    ) THEN
        ALTER TABLE invoices ADD COLUMN paid_date DATE;
    END IF;
END $$;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.set_invoice_paid_date() 
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the status is being updated to 'paid'
  IF (NEW.status = 'paid' AND (OLD.status != 'paid' OR OLD.status IS NULL)) THEN
    -- Set the paid_date to the current date
    NEW.paid_date := CURRENT_DATE;
  -- If the status is changed from 'paid' to something else, clear the paid_date
  ELSIF (OLD.status = 'paid' AND NEW.status != 'paid') THEN
    NEW.paid_date := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist (to avoid errors on re-run)
DROP TRIGGER IF EXISTS on_invoice_status_update ON invoices;
DROP TRIGGER IF EXISTS on_invoice_insert ON invoices;

-- Create the triggers
CREATE TRIGGER on_invoice_status_update
  BEFORE UPDATE OF status ON invoices
  FOR EACH ROW EXECUTE PROCEDURE public.set_invoice_paid_date();

CREATE TRIGGER on_invoice_insert
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE PROCEDURE public.set_invoice_paid_date();

-- Update existing 'paid' invoices to have a paid_date if they don't already
UPDATE invoices
SET paid_date = CURRENT_DATE
WHERE status = 'paid' AND paid_date IS NULL; 