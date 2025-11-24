"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [message, setMessage] = useState("");
  const [pid, setPid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ NEW SUCCESS STATE
  const [success, setSuccess] = useState(false);

  // ------------------------------------------------
  // Send OTP
  // ------------------------------------------------
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const checkUserres = await fetch("/api/check-user-exist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const userstate = await checkUserres.json();
      if (!checkUserres.ok) {
        setMessage(userstate.error || "حدث خطأ أثناء التحقق من وجود المستخدم");
        return;
      }

      if (userstate.exists) {
        const playerRes = await fetch("/api/get-playerInfo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const playerData = await playerRes.json();

        if (!playerRes.ok) {
          setMessage(playerData.error || "حدث خطأ أثناء جلب معلومات اللاعب");
          return;
        }

        setPid(playerData.playerInfo[0].playerid);

        const res = await fetch("/api/otp/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            pid: playerData.playerInfo[0].playerid,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.error || "حدث خطأ أثناء إرسال رمز التحقق.");
          return;
        }

        setStep("otp");
        setMessage("✅ تم إرسال رمز التحقق إلى بريدك الإلكتروني");
      } else {
        setMessage("هذا البريد الإلكتروني غير مسجل. يرجى إنشاء حساب جديد.");
      }
    } catch (error) {
      console.error("[Send OTP Error]", error);
      setMessage("حدث خطأ داخلي في الخادم.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // Verify OTP
  // ------------------------------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/otp/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otpCode: otp, pid }),
    });

    if (res.ok) {
      // 🎉 SHOW SUCCESS CARD
      setSuccess(true);

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      setMessage("رمز التحقق غير صحيح");
      setOtp("");
    }

    setLoading(false);
  };

  // ------------------------------------------------
  // SUCCESS CARD UI
  // ------------------------------------------------
  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">تم تسجيل الدخول!</h2>
              <p className="text-muted-foreground">جاري تحويلك...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // ------------------------------------------------
  // MAIN PAGE UI
  // ------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
            <CardDescription>أدخل بريدك الإلكتروني للحصول على رمز التحقق</CardDescription>
          </CardHeader>
          <CardContent>
            {message && <p className="text-sm text-center text-red-500 mb-3">{message}</p>}

            {/* EMAIL STEP */}
            {step === "email" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />

                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "إرسال رمز التحقق"}
                </Button>

                <p className="text-center text-sm mt-2">
                  لا تملك حساب؟{" "}
                  <Link href="/signupForm" className="text-primary underline">
                    إنشاء حساب
                  </Link>
                </p>
              </form>
            )}

            {/* OTP STEP */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 mt-3">
                <Label>رمز التحقق</Label>

                <Input
                  type="text"
                  value={otp}
                  maxLength={6}
                  inputMode="numeric"
                  dir="ltr"
                  className="text-center text-2xl tracking-widest font-mono"
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  disabled={loading}
                />

                <p className="text-xs text-muted-foreground text-center">أدخل الكود المكون من 6 أرقام</p>

                <Button className="w-full" type="submit" disabled={loading || otp.length !== 6}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "تحقق"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
