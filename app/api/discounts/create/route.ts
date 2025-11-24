import { sql } from "@/lib/db";


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { fieldid, discount_percentage, start_date, end_date, active } = body;

    // Basic validation (no Zod)
    if (!discount_percentage || discount_percentage <= 0 || discount_percentage > 100)
      return Response.json({ error: "Invalid discount percentage" }, { status: 400 });

    if (!start_date || !end_date)
      return Response.json({ error: "Dates are required" }, { status: 400 });

    // Insert
    const [row] =await sql`
      INSERT INTO public.discount (fieldid, discount_percentage, start_date, end_date, active)
      VALUES (${fieldid}, ${discount_percentage}, ${start_date}, ${end_date}, ${active})
      RETURNING *
    `;

    return Response.json(row);
  } catch (error) {
    console.error("Create Discount Error:", error);
    return Response.json({ error: "Failed to create discount" }, { status: 500 });
  }
}
