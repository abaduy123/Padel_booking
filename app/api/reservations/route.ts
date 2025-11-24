// app/api/admin/reservations/route.ts
import { sql } from "@/lib/db";

import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin_session";



// Allowed statuses (Arabic)

const STATUS_DEPOSIT_PAID = "تم دفع العربون";
const STATUS_PAYMENT_FULL = "تم دفع المبلغ كاملا";
const STATUS_REFUNDED = "تم ارجاع المبلغ للعميل";

const ALLOWED_TRANSITIONS_FROM_DEPOSIT = [
  STATUS_PAYMENT_FULL,
  STATUS_REFUNDED,
];

// ==========================================================
// GET /api/admin/reservations
// ==========================================================
export async function GET() {
  try {
    const admin = await getAdmin();
    if (!admin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (err) {
    // If getAdmin crashes → still return Unauthorized instead of crashing client
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await sql`SELECT * FROM public.get_all_reservations()`;
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Fetch reservations error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

// ==========================================================
// PATCH /api/admin/reservations
// Update reservation status
// ==========================================================
export async function PATCH(req: Request) {
 

  try {
    const body = await req.json();
    const { reservationid, newStatus } = body;

    if (!reservationid || !newStatus) {
      return NextResponse.json(
        { error: "reservationid and newStatus are required" },
        { status: 400 }
      );
    }

    // Validate target status
    if (!ALLOWED_TRANSITIONS_FROM_DEPOSIT.includes(newStatus)) {
      return NextResponse.json(
        { error: "Invalid target status" },
        { status: 400 }
      );
    }

    // Get current status
    const existing = await sql`
      SELECT status FROM public.reservation WHERE reservationid = ${reservationid}
    `;

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    const currentStatus = existing[0].status;

    // Only allow update when current = "تم دفع العربون"
    if (currentStatus !== STATUS_DEPOSIT_PAID) {
      return NextResponse.json(
        { error: `Status must be "${STATUS_DEPOSIT_PAID}" to allow update` },
        { status: 403 }
      );
    }

    // Perform the update
    const updated = await sql`
      UPDATE public.reservation
      SET status = ${newStatus}
      WHERE reservationid = ${reservationid}
      RETURNING reservationid, pid, fid, rdate, rtime, status, reservation_cost
    `;

    return NextResponse.json({
      success: true,
      updated: updated[0],
    });
  } catch (err) {
    console.error("Update reservation status error:", err);
    return NextResponse.json(
      { error: "Failed to update reservation status" },
      { status: 500 }
    );
  }
}
