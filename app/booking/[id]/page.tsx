import { fetchFieldsWithDiscounts } from "@/lib/discount";
import BookingClient from "./bookingClient";
import { sql } from "@/lib/db";

import { getCurrentUser } from "@/lib/session";




interface PageProps {
  params: { id: string };
}

export default async function BookingPage({ params }: PageProps) {
  "use server";

  const fetchedFields = await fetchFieldsWithDiscounts();
  const { id } = params;
  const session = await getCurrentUser();
  

  const field = fetchedFields
    .filter((f) => f.fieldid === Number(id))
    .map((field) => ({
      fieldid: field.fieldid,
      fieldname: field.fieldname,
      fieldtype: field.fieldtype,

      original_cost: field.original_cost,
      final_cost: field.final_cost,

      // 🔥 FIX: match expected client type
      discounts: field.discounts.map((d: any) => ({
        fieldid: d.fieldid,
        discount_percentage: d.discount_percentage,
        start_date: d.start_date,
        end_date: d.end_date,
        active: d.active,
      })),

      total_discount_percentage: field.total_discount_percentage,
    }));


  console.log(field);

  return <BookingClient fields={field} GetForm={GetForm} session={session} />;
}

export async function GetForm(formData: FormData) {
  "use server";
  const fieldId = Number(formData.get("fieldId"));
  const fisrtName = formData.get("firstname") as string;
  const lastName = formData.get("lastname") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;

  console.log("Form Data:", { fisrtName, lastName, email, phone, date, time });

  await insertPlayerInfo({
    name: `${fisrtName} ${lastName}`,
    email,
    phone,
  });

  await insertReservationInfo({
    email,
    date,
    time,
    fieldId,
  });
}

async function insertPlayerInfo(playerInfo: {
  name: string;
  email: string;
  phone: string;
}) {
  "use server";

  const { name, email, phone } = playerInfo;
  console.log("Inserting Player Info:", { name, email, phone });

  try {
    const existingPlayer = await sql`
      SELECT playerid FROM public.player WHERE email = ${email}
    `;

    if (existingPlayer.length > 0) {
      console.log("Player already exists, skipping insert.");
      return existingPlayer[0].playerid;
    }

    await sql`
      INSERT INTO public.player (playername, pnumber, email)
      VALUES (${name}, ${phone}, ${email})
    `;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to insert or fetch player info.");
  }
}

async function insertReservationInfo(reservationInfo: {
  email: string;
  date: string;
  time: string;
  fieldId: number;
}) {
  "use server";

  const { date, time, fieldId, email } = reservationInfo;
  const playerId = await gePlayerId(email);
  const initialStatus = "قيد الانتظار";
  const created_at = new Date(Date.now());
   // Get the field details
  const field = (await fetchFieldsWithDiscounts()).find(f => f.fieldid === fieldId);
  if (!field) throw new Error("Field not found for reservation");

  // Check for active discount for this field or global discount
  const hasActiveDiscount = field.discounts.some(d => 
    d.active && (d.fieldid === fieldId || d.fieldid === null)
  );

  // Calculate reservation cost
  const reservationCost = hasActiveDiscount ? field.final_cost : field.original_cost;

  try {
    await sql`
      INSERT INTO public.reservation (pid, fid, rdate, status, rtime, create_at , reservation_cost , rfieldname)
      VALUES (${playerId}, ${fieldId}, ${date}, ${initialStatus}, ${time}, ${created_at}, ${reservationCost}, ${field.fieldname})
    `;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to insert reservation info.");
  }
}

async function gePlayerId(email: string) {
  "use server";

  const result = await sql`
    SELECT playerid FROM public.player WHERE email = ${email}
  `;

  if (result.length === 0) {
    throw new Error("Player not found");
  }

  return result[0].playerid;
}
