import { sql } from "@/lib/db";



export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const {
      discountid,
      fieldid, // nullable → means global
      discount_percentage,
      start_date,
      end_date,
      active,
    } = body;

    // Validate required fields
    if (!discountid)
      return Response.json({ error: "discountid is required" }, { status: 400 });

    if (!discount_percentage || discount_percentage < 1 || discount_percentage > 100)
      return Response.json({ error: "Invalid discount percentage" }, { status: 400 });

    if (!start_date || !end_date)
      return Response.json({ error: "start_date and end_date are required" }, { status: 400 });

    // Safety: ensure the discount exists
    const existing = await sql`
      SELECT discountid FROM public.discount WHERE discountid = ${discountid}
    `;

    if (existing.length === 0)
      return Response.json({ error: "Discount not found" }, { status: 404 });

    // Update logic:
    await sql`
      UPDATE public.discount
      SET
        fieldid = ${fieldid}, 
        discount_percentage = ${discount_percentage},
        start_date = ${start_date},
        end_date = ${end_date},
        active = ${active}
      WHERE discountid = ${discountid}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Update Discount Error:", error);
    return Response.json({ error: "Failed to update discount" }, { status: 500 });
  }
}
