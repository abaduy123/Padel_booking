import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { sql } from "@/lib/db";





export async function POST(request: NextRequest) { 
 
try {
   
    const paymentInfo = await request.json();
    console.log("Received payment webhook:", paymentInfo);
    const success = paymentInfo?.obj?.success;
    const merchantOrderId = paymentInfo?.obj?.order?.merchant_order_id;

    if (!success || !merchantOrderId) {
        return NextResponse.json({ error: "Invalid webhook data" }, { status: 400 });
    }
        const specialRef = merchantOrderId; 
        const reservationId = parseInt(specialRef.split("_")[1], 10);

    if (success == true) {
        await sql`
        UPDATE public.reservation
        SET status = 'تم دفع العربون'
        WHERE reservationID = ${reservationId}
        `;

        
    }
    else if (success == false) {
        await sql`
        UPDATE public.reservation
        SET status = 'فشل الدفع'
        WHERE reservationID = ${reservationId}
        `;
    }


    return NextResponse.json({ status: 200 });
    
    


} catch (error) {
    console.error("Error processing payment webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}


}