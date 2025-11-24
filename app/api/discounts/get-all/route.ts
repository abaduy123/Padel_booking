import { sql } from "@/lib/db";

import { getAdmin } from "@/lib/admin_session";



export async function GET() {
  // --- ADMIN CHECK (with safe try/catch) ---
  try {
    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  } catch (err) {
    // getAdmin FAILED → still unauthorized
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // --- MAIN LOGIC ---
  try {
    await sql`
      UPDATE public.discount
      SET active = 
      CASE
        WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN TRUE
        WHEN end_date < CURRENT_DATE THEN FALSE
        WHEN start_date > CURRENT_DATE THEN FALSE
        ELSE active
      END
    `;

    const discounts = await sql`
      SELECT * FROM public.discount ORDER BY discountid DESC
    `;

    return Response.json(discounts, { status: 200 });

  } catch (error) {
    console.error("List Discounts Error:", error);
    return Response.json(
      { error: "Failed to load discounts" },
      { status: 500 }
    );
  }
}
