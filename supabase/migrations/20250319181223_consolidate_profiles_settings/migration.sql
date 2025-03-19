-- Migrate any missing data from profiles to settings
UPDATE public.settings s
SET 
  business_name = COALESCE(s.business_name, p.business_name),
  business_address = COALESCE(s.business_address, p.business_address),
  business_phone = COALESCE(s.business_phone, p.business_phone),
  business_email = COALESCE(s.business_email, p.business_email),
  tax_id = COALESCE(s.tax_id, p.tax_id),
  logo_url = COALESCE(s.logo_url, p.logo_url)
FROM public.profiles p
WHERE s.user_id = p.id;

-- Modify the handle_new_user() function to not create profile records
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN  
  INSERT INTO public.settings (user_id, invoice_prefix, next_invoice_number, default_payment_terms, tax_rate)
  VALUES (NEW.id, 'INV-', 1, 30, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Drop the profiles table
DROP TABLE IF EXISTS public.profiles; 