import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

    // Get the form data with the file
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const fileType = file.type;
    if (
      !["image/jpeg", "image/png", "image/svg+xml", "image/webp"].includes(
        fileType
      )
    ) {
      return NextResponse.json(
        { error: "Invalid file type. Supported types: JPEG, PNG, SVG, WEBP" },
        { status: 400 }
      );
    }

    // Create a filename with the user ID and original extension
    const fileExt = file.name.split(".").pop();
    const fileName = `logo_${session.user.id}_${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("business_assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading logo:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload logo" },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("business_assets").getPublicUrl(filePath);

    // Update the user's settings with the new logo URL
    const { error: updateError } = await supabase
      .from("settings")
      .update({
        logo_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.user.id);

    if (updateError) {
      console.error("Error updating settings with logo URL:", updateError);
      return NextResponse.json(
        { error: "Failed to update settings with logo URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logo_url: publicUrl,
    });
  } catch (error) {
    console.error("Error handling logo upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current settings to find the logo URL
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("logo_url")
      .eq("user_id", session.user.id)
      .single();

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 }
      );
    }

    if (!settings?.logo_url) {
      return NextResponse.json(
        { error: "No logo found to delete" },
        { status: 404 }
      );
    }

    // Extract the file path from the URL
    const logoUrl = settings.logo_url;
    const path = logoUrl.split("business_assets/")[1];

    if (!path) {
      return NextResponse.json(
        { error: "Invalid logo URL format" },
        { status: 400 }
      );
    }

    // Delete the file from storage
    const { error: deleteError } = await supabase.storage
      .from("business_assets")
      .remove([path]);

    if (deleteError) {
      console.error("Error deleting logo:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete logo" },
        { status: 500 }
      );
    }

    // Update settings to remove the logo URL
    const { error: updateError } = await supabase
      .from("settings")
      .update({
        logo_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.user.id);

    if (updateError) {
      console.error(
        "Error updating settings after logo deletion:",
        updateError
      );
      return NextResponse.json(
        { error: "Failed to update settings after logo deletion" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling logo deletion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
