import { sql } from "@/lib/db";



export async function DELETE(req: Request) {
  const { fieldid } = await req.json();

  try {
    if (!fieldid) {
      return new Response(
        JSON.stringify({ error: "fieldid is required" }),
        { status: 400 }
      );
    }

    // Soft delete
    await sql`
      UPDATE public.field
      SET deleted = TRUE
      WHERE fieldid = ${fieldid}
    `;

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err: any) {
    console.error("حصل خطأ اثناء الحذف", err);

    return new Response(
      JSON.stringify({ error: "حدث خطأ أثناء الحذف." }),
      { status: 500 }
    );
  }
}
