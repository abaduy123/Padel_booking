import {sql} from "@/lib/db"


export async function fetchAllFields() {
  try {
    const data = await sql `
      SELECT fieldid, fieldname, fieldcost , fieldtype from public.field`;

    const AllFields = data.map((field) => ({
      ...field,

    }));
    return AllFields;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch fields.');
  }
}