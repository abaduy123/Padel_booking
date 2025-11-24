import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";

import jwt from "jsonwebtoken";



export async function GET() {
  try {
    
     const cookieStore = await cookies(); 
     const token = cookieStore.get("session")?.value;
    if (!token) {
      return NextResponse.json({ reservations: [] });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const email = decoded.email;

   

    // Get playerid from email
    const player = await sql`
      SELECT playerid FROM public.player WHERE email = ${email}
    `;

    if (player.length === 0) {
      return NextResponse.json({ reservations: [] });
    }

    const pid = player[0].playerid;

    // Call stored procedure
    const reservations = await sql`
      SELECT * FROM public.get_player_reservations(${pid})
    `;

    return NextResponse.json({ reservations });
  } catch (err) {
    console.error("My Reservations Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
