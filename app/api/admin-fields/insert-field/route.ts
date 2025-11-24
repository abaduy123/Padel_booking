import { sql } from "@/lib/db";



export async function POST(req: Request) {
  const { fieldname, fieldtype, fieldcost, description } = await req.json();

  const inserted = await sql`
    INSERT INTO public.field (fieldname, fieldtype, fieldcost , description)
    VALUES (${fieldname}, ${fieldtype}, ${fieldcost} , ${description})
    RETURNING *;
  `;

  return new Response(JSON.stringify(inserted[0]));
}
