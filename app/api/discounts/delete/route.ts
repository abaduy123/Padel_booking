import { sql } from "@/lib/db";



export async function DELETE(req: Request) {
  try {
    const { discountid } = await req.json();

    await sql`
      DELETE FROM public.discount WHERE discountid = ${discountid}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete Discount Error:", error);
    return Response.json({ error: "Failed to delete discount" }, { status: 500 });
  }
}
