"use client"

import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { XCircle } from "lucide-react"

export default function PaymentFailurePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">فشل الدفع</h1>
              <p className="text-muted-foreground">
                لم نتمكن من معالجة دفعتك. يرجى محاولة مرة أخرى أو التواصل مع الدعم.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-left space-y-2">
              <div className="text-red-800 font-medium">✗ حدث خطأ أثناء الدفع</div>
              <div className="text-red-700 text-xs">• الرجاء التحقق من بيانات بطاقتك</div>
              <div className="text-red-700 text-xs">• تأكد من توفر الرصيد الكافي</div>
              <div className="text-red-700 text-xs">• حاول مرة أخرى لاحقاً</div>
            </div>

            <div className="space-y-2">
              <Button onClick={() => router.back()} className="w-full bg-red-600 hover:bg-red-700 text-white">
                العودة لمحاولة الدفع مجدداً
              </Button>
              <Button onClick={() => router.push("/")} variant="outline" className="w-full">
                العودة للرئيسية
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
