import { getCurrentUser } from "@/lib/session"

import LoginForm from "../loginForm/page"
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default async function Login() {
 const user = await getCurrentUser()

  if (user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="flex flex-col items-center justify-center flex-1 p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border border-blue-100">
            
            <h1 className="text-2xl font-bold text-blue-600 text-center mb-4">
              مرحباً بك 👋
            </h1>

            <p className="text-center text-gray-600 mb-6">
              أنت مسجل دخول بالفعل
            </p>

            <div className="space-y-4">
              
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-500">الاسم</p>
                <p className="font-semibold text-blue-700">
                  {user.name} 
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                <p className="font-semibold text-blue-700">{user.email}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-500">رقم الجوال</p>
                <p className="font-semibold text-blue-700">{user.pnumber}</p>
              </div>
            </div>

          </div>
        </div>

        <Footer />
      </div>
    )
  }

  // المستخدم غير مسجل دخول → عرض نموذج الدخول
  return <LoginForm />
}
