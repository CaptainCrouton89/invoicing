import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPhoneNumber } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

async function getClients() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }

  return data || [];
}

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button asChild>
          <Link href="/clients/new">Add New Client</Link>
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card className="text-center py-6">
          <CardHeader>
            <h2 className="text-xl font-medium">No clients yet</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Create your first client to get started
            </p>
            <Button asChild>
              <Link href="/clients/new">Add Your First Client</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="shadow rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell>{client.contact_person || "-"}</TableCell>
                  <TableCell>{client.email || "-"}</TableCell>
                  <TableCell>{formatPhoneNumber(client.phone)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        asChild
                      >
                        <Link href={`/clients/${client.id}`}>View</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        asChild
                      >
                        <Link href={`/clients/${client.id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        asChild
                      >
                        <Link href={`/clients/${client.id}/invoices/new`}>
                          New Invoice
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
