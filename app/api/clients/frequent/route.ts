import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check if user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First get clients with their invoice counts
    const { data, error } = await supabase
      .from("clients")
      .select(
        `
        id,
        name,
        email,
        invoices(id, total_amount)
      `
      )
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching clients:", error);
      return NextResponse.json(
        { error: "Failed to fetch clients" },
        { status: 500 }
      );
    }

    // Process the data to count invoices and total amount billed
    const frequentClients = data.map((client) => {
      const invoiceCount = client.invoices ? client.invoices.length : 0;
      const totalBilled = client.invoices
        ? client.invoices.reduce(
            (sum, invoice) => sum + (invoice.total_amount || 0),
            0
          )
        : 0;

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        invoice_count: invoiceCount,
        total_billed: totalBilled,
      };
    });

    // Sort by invoice count (descending) and return top 5
    const sortedClients = frequentClients
      .sort(
        (a, b) =>
          b.invoice_count - a.invoice_count || b.total_billed - a.total_billed
      )
      .slice(0, 5);

    return NextResponse.json(sortedClients);
  } catch (error) {
    console.error("Error in frequent clients route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
