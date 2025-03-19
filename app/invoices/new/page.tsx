import InvoiceForm from "@/components/InvoiceForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function NewInvoicePage() {
  const supabase = await createClient();

  // Check if the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Invoice</h1>
      <InvoiceForm mode="create" />
    </div>
  );
}
