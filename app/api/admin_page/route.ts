import { getAdmin } from "@/lib/admin_session";

export async function GET() {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return Response.json({ authorized: false }, { status: 401 });
    }

    return Response.json({ authorized: true, admin });
  } catch (err) {
    return Response.json({ authorized: false }, { status: 500 });
  }
}
 