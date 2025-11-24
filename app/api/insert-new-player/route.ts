import { sql } from "@/lib/db";




export async function POST(request: Request) {
    
    try {  

        const { firstName, lastName, phone, email } = await request.json();

        const name = `${firstName} ${lastName}`; 

        if (!name || !phone || !email ) {
            return Response.json({ error: "All fields are required" }, { status: 400 })
        }
        
      
        const playerId = await sql`
        INSERT INTO public.player (playername, pnumber, email)
        VALUES (${name}, ${phone}, ${email})
        RETURNING playerid
      
        `;

        return Response.json({ success: true, playerId: playerId[0].playerid }, { status: 200 })
        

    } catch (error) {
        console.error("[Insert New Player Error]", error)
        return Response.json({ error: "Failed to insert new player" }, { status: 500 })
    }

}
