import { sql } from "@/lib/db";


import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const intentionUrl = process.env.PAYMENT_INTENTION_URL;

const secretKey = process.env.PAYMENT_SECRET_KEY;
const publicKey = process.env.PAYMENT_PUBLIC_KEY;
const integrationId = process.env.Integration_ID;
const checkoutBase = process.env.NEXT_PUBLIC_PAYMOB_CHECKOUT!;


export async function POST(request: NextRequest) {

    try {
        const { email, phone, firstName, lastName, amount, fieldName, playerId } = await request.json()

        // Validate input
        if (!email || !phone || !firstName || !lastName || !amount || !playerId || !fieldName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }
       

        const result = sql`SELECT reservationID FROM public.reservation 
        WHERE pid = ${playerId} AND status = 'قيد الانتظار'
        ORDER BY create_at DESC
        LIMIT 1
            
        `;
        const reservations = await result;
        if (!reservations || reservations.length === 0) {
            return NextResponse.json({ error: "No pending reservation found for this player" }, { status: 404 })
        }
        const reservationID = reservations[0].reservationid;
        
        let payload = {
            amount: amount * 100, // Convert to cents
            currency: "SAR",
            payment_methods: [
                Number(integrationId)
            ]
                
            
        ,
            items: [
                {
                    name: fieldName,
                    amount: amount * 100,
                }],
            billing_data: {
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone_number: phone,
            },
            special_reference: `ReservationID_${reservationID}`,
            redirection_url: `${process.env.NEXT_PUBLIC_BASE_URL}/Payment-redirection`,
    

        }


        // Create payment intention
        const response = await fetch(intentionUrl!, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",

                "Authorization": `Token ${secretKey!}`,
            },
            body: JSON.stringify({

                ...payload
            })
        })

        const data = await response.json()
        if (!response.ok) {
            console.error("[Payment API Error]", data)
            return NextResponse.json({ error: "Failed to create payment intention" }, { status: 500 })
        }
        const clientSecret = data.client_secret;
        const checkoutUrl = `${checkoutBase}?publicKey=${publicKey}&clientSecret=${clientSecret}`;


    
        return NextResponse.json({ checkoutUrl }, { status: 200 });

    
    } catch (error) {
        console.error("[Payment API Error]", error)
        return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
    }
}


