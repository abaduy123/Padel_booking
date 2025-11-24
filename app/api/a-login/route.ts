
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";






export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    
    // Check credentials
    const admins = await sql`
  SELECT * FROM public.admin_user WHERE admin_email = ${email}
`;


    
    if (admins.length === 0) {
      return NextResponse.json({ error: "الايميل أو كلمة المرور خاطئة" }, { status: 401 });
    }   

    const passwordMatch = await bcrypt.compare(password, admins[0].admin_pass);
    if (!passwordMatch) {
      return NextResponse.json({ error: "الايميل أو كلمة المرور خاطئة" }, { status: 401 });
    }
    const token = jwt.sign(
      { email: admins[0].admin_email, adminid: admins[0].admin_id },
      process.env.JWT_SECRET!,
        { expiresIn: "7d" },
    );
     const res = NextResponse.json({
          success: true,
          message: "تم التسجيل بنجاح",
        })
        res.cookies.set({
          name: "admin_session",
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });
        return res;

    
    } catch (error) {
        console.error("حصل خطأ اثناء تسجيل الدخول", error);
        return Response.json({ error: "حصل خطأ اثناء تسجيل الدخول" }, { status: 500 });
    }
}