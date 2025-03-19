import { Settings } from "@/lib/types";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// GET /api/settings - Fetch user settings
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's settings
    const { data: settings, error } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is returned when no rows found
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 }
      );
    }

    // If no settings found, create default settings
    if (!settings) {
      const defaultSettings: Partial<Settings> = {
        user_id: session.user.id,
        invoice_prefix: "INV-",
        next_invoice_number: 1001,
        default_payment_terms: 30,
        tax_rate: 0,
        theme_color: "#3b82f6", // Default blue
        footer_notes: "Thank you for your business.",
      };

      const { data: newSettings, error: createError } = await supabase
        .from("settings")
        .insert(defaultSettings)
        .select("*")
        .single();

      if (createError) {
        console.error("Error creating default settings:", createError);
        return NextResponse.json(
          { error: "Failed to create default settings" },
          { status: 500 }
        );
      }

      return NextResponse.json(newSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error handling settings request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/settings - Update user settings
export async function POST(request: NextRequest) {
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

    // Ensure user can only update their own settings
    body.user_id = session.user.id;

    // Update settings
    const { data: settings, error } = await supabase
      .from("settings")
      .upsert({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error updating settings:", error);
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error handling settings update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
