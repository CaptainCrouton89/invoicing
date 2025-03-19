import { BusinessInfo, sendInvoiceEmail } from "@/lib/email";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { recipientEmail, businessInfo } = body as {
      recipientEmail?: string;
      businessInfo: BusinessInfo;
    };

    // Get invoice data with client and items
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(
        `
        *,
        items:invoice_items(*),
        clients:clients(*)
      `
      )
      .eq("id", params.id)
      .eq("user_id", session.user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "Failed to fetch invoice data" },
        { status: 404 }
      );
    }

    // Send the email
    const result = await sendInvoiceEmail(
      invoice,
      businessInfo,
      recipientEmail
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Update invoice status to "sent" if it was in "draft"
    if (invoice.status === "draft") {
      await supabase
        .from("invoices")
        .update({ status: "sent" })
        .eq("id", params.id);
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return NextResponse.json(
      { error: "Failed to send invoice email" },
      { status: 500 }
    );
  }
}
