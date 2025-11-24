import { sql } from "@/lib/db";



import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";


export async function POST(request: NextRequest) {
  try {
    const { email, otpCode, pid } = await request.json()

    if (!email || !otpCode || !pid) {
      return NextResponse.json({ error: "Email, OTP code, and Player ID are required" }, { status: 400 })
    }

   

    // Find OTP record
    const records = await sql`
      SELECT * FROM public.otp 
      WHERE pid = ${pid} AND email = ${email} AND otp_code = ${otpCode} AND verified = FALSE
      ORDER BY create_at DESC
      LIMIT 1
    `

    if (!records || records.length === 0) {
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 })
    }

    const otpRecord = records[0]

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 })
    }

    // Mark OTP as verified
    await sql`
      UPDATE public.otp SET verified = TRUE 
      WHERE pid = ${pid}
    `
    const playerInfo = await sql`
                      SELECT playername, pnumber, email
                      FROM public.player
                      WHERE email = ${email}
                      LIMIT 1
                    `;

    if (playerInfo.length === 0) {
      return NextResponse.json(
        { error: "User record not found" },
        { status: 404 }
      );
    }

    const user = playerInfo[0];



    // Create session token

    const token = jwt.sign({email: user.email,
                            name: user.playername,
                            pnumber: user.pnumber},
                            process.env.JWT_SECRET!, { expiresIn: "7d" }
                          );



    const res = NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    })
    res.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    return res;
  } catch (error) {
    console.error("[OTP Verification Error]", error)
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 })
  }
}
