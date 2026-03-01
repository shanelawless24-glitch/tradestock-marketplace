import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hashToken } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Invitation {
  id: string;
  email: string;
  role_target: "admin" | "sdr" | "dealer";
  dealer_id: string | null;
  sdr_id: string | null;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
  created_at: string;
  created_by: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const tokenHash = await hashToken(token);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: invitationData, error } = await (supabase.from("invitations") as any)
      .select("*")
      .eq("token_hash", tokenHash)
      .single();

    if (error || !invitationData) {
      return NextResponse.json(
        { valid: false, error: "Invalid invitation" },
        { status: 404 }
      );
    }

    const invitation = invitationData as Invitation;

    if (invitation.used_at) {
      return NextResponse.json(
        { valid: false, error: "Invitation already used" },
        { status: 400 }
      );
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "Invitation expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      invitation: {
        email: invitation.email,
        role: invitation.role_target,
      },
    });
  } catch (error) {
    console.error("Validate invite error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate invitation" },
      { status: 500 }
    );
  }
}
