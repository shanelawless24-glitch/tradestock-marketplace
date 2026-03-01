import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const tokenHash = await hashToken(token);

    const { data: invitationData, error: inviteError } = await supabase
      .from("invitations")
      .select("*")
      .eq("token_hash", tokenHash)
      .single();

    if (inviteError || !invitationData) {
      return NextResponse.json(
        { error: "Invalid invitation" },
        { status: 404 }
      );
    }

    const invitation = invitationData as Invitation;

    if (invitation.used_at) {
      return NextResponse.json(
        { error: "Invitation already used" },
        { status: 400 }
      );
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Invitation expired" },
        { status: 400 }
      );
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any).insert({
      id: userId,
      email: invitation.email,
      role: invitation.role_target,
      is_active: true,
    });

    let requiresSubscription = false;

    if (invitation.role_target === "dealer" && invitation.dealer_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("dealers") as any)
        .update({
          user_id: userId,
          status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("id", invitation.dealer_id);

      const { data: promoAvailable } = await supabase.rpc("promo_lifetime_available");
      
      if (promoAvailable) {
        await supabase.rpc("consume_promo_lifetime");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("dealers") as any)
          .update({ lifetime_discount: true })
          .eq("id", invitation.dealer_id);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("subscriptions") as any).insert({
        dealer_id: invitation.dealer_id,
        status: "inactive",
        lifetime_active: promoAvailable || false,
      });

      requiresSubscription = true;
    } else if (invitation.role_target === "sdr" && invitation.sdr_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("sdrs") as any)
        .update({ user_id: userId })
        .eq("id", invitation.sdr_id);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("invitations") as any)
      .update({
        used_at: new Date().toISOString(),
        used_by: userId,
      })
      .eq("id", invitation.id);

    return NextResponse.json({
      success: true,
      role: invitation.role_target,
      requiresSubscription,
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json(
      { error: "Failed to process invitation" },
      { status: 500 }
    );
  }
}
