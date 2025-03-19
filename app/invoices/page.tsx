import { Badge } from "@/components/ui/badge";
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
import { Database } from "@/lib/database.types";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

type InvoiceWithClient = Database["public"]["Tables"]["invoices"]["Row"] & {
  clients: Database["public"]["Tables"]["clients"]["Row"];
};

async function getInvoices(): Promise<InvoiceWithClient[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      clients (
        id,
        name,
        email
      )
    `
    )
    .eq("user_id", user.id)
    .order("issue_date", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }

  return (data as InvoiceWithClient[]) || [];
}

function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "paid":
      return "default";
    case "sent":
      return "secondary";
    case "overdue":
      return "destructive";
    default:
      return "outline";
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button asChild>
          <Link href="/invoices/new">Create New Invoice</Link>
        </Button>
      </div>

      {invoices.length === 0 ? (
        <Card className="text-center py-6">
          <CardHeader>
            <h2 className="text-xl font-medium">No invoices yet</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Create your first invoice to get started
            </p>
            <Button asChild>
              <Link href="/invoices/new">Create Your First Invoice</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table (hidden on small screens) */}
          <div className="hidden md:block shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {invoice.invoice_number}
                        </Link>
                      </TableCell>
                      <TableCell>{invoice.clients.name}</TableCell>
                      <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                      <TableCell>{formatDate(invoice.due_date)}</TableCell>
                      <TableCell>
                        {formatCurrency(invoice.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            asChild
                          >
                            <Link href={`/invoices/${invoice.id}`}>View</Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            asChild
                          >
                            <Link href={`/invoices/${invoice.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card View (shown only on small screens) */}
          <div className="md:hidden space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardHeader className="p-4 border-b flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {invoice.invoice_number}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {invoice.clients.name}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Issue Date:
                    </span>
                    <span className="text-sm font-medium">
                      {formatDate(invoice.issue_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Due Date:
                    </span>
                    <span className="text-sm font-medium">
                      {formatDate(invoice.due_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Amount:
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(invoice.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="h-8" asChild>
                      <Link href={`/invoices/${invoice.id}`}>View</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8" asChild>
                      <Link href={`/invoices/${invoice.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
