import ClientForm from "@/components/ClientForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function NewClientPage() {
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
      <h1 className="text-2xl font-bold mb-6">Add New Client</h1>
      <ClientForm mode="create" />
    </div>
  );
}
