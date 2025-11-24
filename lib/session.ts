import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken"

export async function getCurrentUser() {
  const cookieStore = await cookies(); 
  const session = cookieStore.get("session")?.value;
  
  if (!session) return null;

  try {
    const payload = jwt.verify(session, process.env.JWT_SECRET!) as JwtPayload & {
      name: string,
      pnumber: string,
      email: string
    };
    console.log("SESSION PAYLOAD:", payload)

    return payload; // contains { email }
  } catch (err) {
    return null; // invalid token
  }
}
