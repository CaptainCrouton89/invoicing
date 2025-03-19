import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Check if the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get search parameters
  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get("clientId");
  const status = searchParams.get("status");

  let query = supabase
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

  // Add filters if provided
  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check if the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.client_id || !body.issue_date || !body.due_date) {
      return NextResponse.json(
        { error: "Client, issue date and due date are required" },
        { status: 400 }
      );
    }

    // Check if client exists and belongs to user
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", body.client_id)
      .eq("user_id", user.id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get next invoice number from settings
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("invoice_prefix, next_invoice_number")
      .eq("user_id", user.id)
      .single();

    if (settingsError) {
      return NextResponse.json(
        { error: "Could not retrieve settings" },
        { status: 500 }
      );
    }

    // Generate invoice number
    const invoicePrefix = settings?.invoice_prefix || "INV-";
    const nextInvoiceNumber = settings?.next_invoice_number || 1;
    const invoiceNumber = `${invoicePrefix}${String(nextInvoiceNumber).padStart(4, "0")}`;

    // Prepare data
    const invoiceData = {
      ...body,
      user_id: user.id,
      invoice_number: invoiceNumber,
      status: body.status || "draft",
      subtotal: body.subtotal || 0,
      tax_amount: body.tax_amount || 0,
      discount_amount: body.discount_amount || 0,
      total_amount: body.total_amount || 0,
    };

    // Start transaction
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert(invoiceData)
      .select()
      .single();

    if (invoiceError) {
      return NextResponse.json(
        { error: invoiceError.message },
        { status: 500 }
      );
    }

    // Insert invoice items if provided
    if (body.items && body.items.length > 0) {
      const items = body.items.map((item: any) => ({
        ...item,
        invoice_id: invoice.id,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(items);

      if (itemsError) {
        return NextResponse.json(
          { error: itemsError.message },
          { status: 500 }
        );
      }
    }

    // Update next invoice number in settings
    const { error: updateError } = await supabase
      .from("settings")
      .update({ next_invoice_number: nextInvoiceNumber + 1 })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update next invoice number:", updateError);
      // Continue anyway as the invoice was created successfully
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
