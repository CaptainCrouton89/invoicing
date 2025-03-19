import { Client } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
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

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const client = await getClient(params.id);

  if (!client) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        <div className="flex space-x-2">
          <Link
            href={`/clients/${client.id}/edit`}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition duration-200"
          >
            Edit Client
          </Link>
          <Link
            href={`/clients/${client.id}/invoices/new`}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
          >
            Create Invoice
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Contact Information</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Contact Person:</span>{" "}
                  {client.contact_person || "—"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span>{" "}
                  {client.email || "—"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Phone:</span>{" "}
                  {client.phone || "—"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Address:</span>{" "}
                  <span className="whitespace-pre-line">
                    {client.address || "—"}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Billing Information</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Payment Terms:</span>{" "}
                  {client.default_payment_terms
                    ? `${client.default_payment_terms} days`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
          {client.notes && (
            <div>
              <h3 className="text-lg font-medium mb-2">Notes</h3>
              <p className="text-sm whitespace-pre-line">{client.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* We'll add invoices list here later */}

      <div className="mt-8 flex justify-end">
        <Link
          href="/clients"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Back to Clients
        </Link>
      </div>
    </div>
  );
}
