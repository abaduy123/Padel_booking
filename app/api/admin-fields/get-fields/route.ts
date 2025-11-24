// app/api/fields/route.ts
import { fetchFieldsWithDiscounts } from "@/lib/discount";
import { getAdmin } from "@/lib/admin_session";

export async function GET() {
  // --- ADMIN AUTH CHECK ---
  try {
    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  } catch (err) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // --- MAIN LOGIC ---
  try {
    const fields = await fetchFieldsWithDiscounts();
    return Response.json(fields, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch fields." },
      { status: 500 }
    );
  }
}
