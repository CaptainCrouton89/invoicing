import ClientForm from "@/components/ClientForm";
import { Client } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

async function getClient(id: string): Promise<Client | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Client;
}

export default async function EditClientPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const client = await getClient(params.id);

  if (!client) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Client</h1>
      <ClientForm client={client} mode="edit" />
    </div>
  );
}
