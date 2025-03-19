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

    // Fetch recent invoices (limited to 10 most recent)
    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select(
        `
        id,
        invoice_number,
        issue_date,
        due_date,
        total_amount,
        status,
        clients(id, name)
      `
      )
      .eq("user_id", user.id)
      .order("issue_date", { ascending: false })
      .limit(10);

    if (invoicesError) {
      console.error("Error fetching recent invoices:", invoicesError);
      return NextResponse.json(
        { error: "Failed to fetch recent invoices" },
        { status: 500 }
      );
    }

    // Format the data
    const formattedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      client_name: invoice.clients.name,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      total_amount: invoice.total_amount,
      status: invoice.status,
    }));

    return NextResponse.json(formattedInvoices);
  } catch (error) {
    console.error("Error in recent invoices route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
