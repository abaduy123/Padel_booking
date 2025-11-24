import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken"

export async function getAdmin() {
  const cookieStore = await cookies(); 
  const session = cookieStore.get("admin_session")?.value;
  
  if (!session) return null;

  try {
    const payload = jwt.verify(session, process.env.JWT_SECRET!) as JwtPayload & {
      adminid: string,
      email: string,
      
    };
    console.log("SESSION PAYLOAD:", payload)

    return payload; 
  } catch (err) {
    return null; 
  }
}
