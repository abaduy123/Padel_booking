import { sql } from "@/lib/db";




export async function POST(request: Request) {
    
    try {  

        const { email } = await request.json();
        console.log("Email received:", email);
        if (!email ) {
            return Response.json({ error: "Email is required" }, { status: 400 })
        }
       
        const records = await sql`
        SELECT * FROM public.player
        WHERE email = ${email}`;

        if (!records || records.length === 0) {
            return Response.json({ error: "No player info found" }, { status: 404 })
        }

        return Response.json({
            success: true,
            playerInfo: records,
        })

     }
    catch (error) {
        console.error("[Player Info Error]", error)
        return Response.json({ error: "Failed to get player info" }, { status: 500 })
    }



}
