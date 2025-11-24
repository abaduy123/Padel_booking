"use client"

import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function PaymentSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">تم الدفع بنجاح!</h1>
              <p className="text-muted-foreground">
                تم معالجة دفعتك بنجاح. سيتم تأكيد حجزك قريباً عبر البريد الإلكتروني.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-left space-y-2">
              <div className="text-green-800 font-medium">✓ تم استكمال جميع خطوات الحجز</div>
              <div className="text-green-700 text-xs">• تم التحقق من البريد الإلكتروني</div>
              <div className="text-green-700 text-xs">• تم معالجة الدفع</div>
              <div className="text-green-700 text-xs">• حجزك مؤكد الآن</div>
            </div>

            <Button onClick={() => router.push("/")} className="w-full bg-green-600 hover:bg-green-700 text-white">
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
