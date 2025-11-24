import { sql } from "@/lib/db";


export async function PATCH(req: Request) {
  const { fieldid, fieldname, fieldtype, fieldcost , description} = await req.json();

  const updated = await sql`
    UPDATE public.field
    SET fieldname = ${fieldname},
        fieldtype = ${fieldtype},
        fieldcost = ${fieldcost},
        description = ${description}
    WHERE fieldid = ${fieldid}
    RETURNING *;
  `;

  return new Response(JSON.stringify(updated[0]));
}
