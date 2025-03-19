import { createClient } from "@/lib/supabase/server";
import { calculateDueStatus } from "@/lib/utils";
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

    // Get current date
    const today = new Date();
    const twoWeeksFromNow = new Date(today);
    twoWeeksFromNow.setDate(today.getDate() + 14);

    // Format dates for SQL query
    const todayStr = today.toISOString().split("T")[0];
    const twoWeeksStr = twoWeeksFromNow.toISOString().split("T")[0];

    // Fetch overdue invoices (due date is before today and not paid)
    const { data: overdueInvoices, error: overdueError } = await supabase
      .from("invoices")
      .select(
        `
        id,
        invoice_number,
        issue_date,
        due_date,
        total_amount,
        status,
        clients(id, name, email)
      `
      )
      .eq("user_id", user.id)
      .eq("status", "sent")
      .lt("due_date", todayStr)
      .order("due_date", { ascending: true });

    if (overdueError) {
      console.error("Error fetching overdue invoices:", overdueError);
      return NextResponse.json(
        { error: "Failed to fetch overdue invoices" },
        { status: 500 }
      );
    }

    // Fetch draft invoices (need to be sent)
    const { data: draftInvoices, error: draftError } = await supabase
      .from("invoices")
      .select(
        `
        id,
        invoice_number,
        issue_date,
        due_date,
        total_amount,
        status,
        clients(id, name, email)
      `
      )
      .eq("user_id", user.id)
      .eq("status", "draft")
      .order("issue_date", { ascending: false })
      .limit(5);

    if (draftError) {
      console.error("Error fetching draft invoices:", draftError);
      return NextResponse.json(
        { error: "Failed to fetch draft invoices" },
        { status: 500 }
      );
    }

    // Fetch upcoming invoices (due in the next 2 weeks)
    const { data: upcomingInvoices, error: upcomingError } = await supabase
      .from("invoices")
      .select(
        `
        id,
        invoice_number,
        issue_date,
        due_date,
        total_amount,
        status,
        clients(id, name, email)
      `
      )
      .eq("user_id", user.id)
      .eq("status", "sent")
      .gte("due_date", todayStr)
      .lte("due_date", twoWeeksStr)
      .order("due_date", { ascending: true });

    if (upcomingError) {
      console.error("Error fetching upcoming invoices:", upcomingError);
      return NextResponse.json(
        { error: "Failed to fetch upcoming invoices" },
        { status: 500 }
      );
    }

    // Format the data
    const formatInvoices = (invoices: any[]) => {
      return invoices.map((invoice) => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        total_amount: invoice.total_amount,
        status: invoice.status,
        days_overdue: invoice.due_date
          ? calculateDueStatus(invoice.due_date)
          : 0,
        client: {
          id: invoice.clients.id,
          name: invoice.clients.name,
          email: invoice.clients.email,
        },
      }));
    };

    return NextResponse.json({
      overdue: formatInvoices(overdueInvoices),
      draft: formatInvoices(draftInvoices),
      upcoming: formatInvoices(upcomingInvoices),
    });
  } catch (error) {
    console.error("Error in dashboard alerts route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
