import InvoiceForm from "@/components/InvoiceForm";
import { Invoice, InvoiceItem } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";

interface EnhancedInvoice extends Invoice {
  items: InvoiceItem[];
}

async function getInvoice(id: string): Promise<EnhancedInvoice | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      items:invoice_items(*)
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as EnhancedInvoice;
}

export default async function EditInvoicePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const supabase = await createClient();

  // Check if the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const invoice = await getInvoice(params.id);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Edit Invoice {invoice.invoice_number}
      </h1>
      <InvoiceForm mode="edit" invoice={invoice} />
    </div>
  );
}
