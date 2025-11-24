import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { sql } from "@/lib/db";


export async function POST(Request:NextRequest) {

    try {
        const { email } = await Request.json();
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }
      

        const user = await sql`
            SELECT * FROM public.player WHERE email = ${email}
        `;
        if (user.length > 0) {
            return NextResponse.json({ exists: true }, { status: 200 });
        } else {
            return NextResponse.json({ exists: false }, { status: 200 });
        }

}   catch (error) {
        console.error("[Check User Exist Error]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
