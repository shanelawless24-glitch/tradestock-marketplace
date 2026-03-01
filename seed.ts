import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminEmail = process.env.ADMIN_EMAIL!;
const adminPassword = process.env.ADMIN_PASSWORD!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

if (!adminEmail || !adminPassword) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seed() {
  console.log("🌱 Starting database seed...\n");

  try {
    // Check if admin user already exists
    const { data: existingUsers } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", adminEmail);

    if (existingUsers && existingUsers.length > 0) {
      console.log("✓ Admin user already exists");
      return;
    }

    // Create admin user
    console.log("Creating admin user...");
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError) {
      console.error("Failed to create admin user:", authError.message);
      process.exit(1);
    }

    const userId = authData.user!.id;
    console.log(`✓ Created admin user: ${adminEmail}`);

    // Create admin profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email: adminEmail,
      role: "admin",
      is_active: true,
      full_name: "System Administrator",
    });

    if (profileError) {
      console.error("Failed to create admin profile:", profileError.message);
      process.exit(1);
    }

    console.log("✓ Created admin profile");

    // Ensure promo counter exists
    const { data: promoCounter } = await supabase
      .from("promo_counters")
      .select("*")
      .eq("id", 1)
      .single();

    if (!promoCounter) {
      await supabase.from("promo_counters").insert({
        id: 1,
        lifetime_activation_count: 0,
        max_lifetime_activations: 100,
        is_active: true,
      });
      console.log("✓ Created promo counter");
    }

    console.log("\n✅ Seed completed successfully!");
    console.log(`\nAdmin credentials:`);
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: [hidden]`);
    console.log(`\nYou can now log in at: http://localhost:3000/auth/login`);

  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
