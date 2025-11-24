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
import PhoneInput from 'react-phone-input-2'
import { ar } from "date-fns/locale"
import 'react-phone-input-2/lib/style.css'

export default function SignupForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [message, setMessage] = useState("");
  const [pid, setPid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);


  // -------------------------
  // SIGNUP + SEND OTP
  // -------------------------
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    if (formData.phone.length < 9 || formData.phone.length > 15) {
      setMessage("⚠️ رقم الهاتف غير صالح.");
      setLoading(false);
      return;
    }


    try {
      // 1️⃣ Check if user exists
      const existRes = await fetch("/api/check-user-exist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const existData = await existRes.json();

      if (existData.exists) {
        setMessage("هذا البريد مسجل مسبقاً — يرجى تسجيل الدخول.");
        setLoading(false);
        return;
      }

      // 2️⃣ Insert new player
      const insertRes = await fetch("/api/insert-new-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!insertRes.ok) {
        setMessage("حدث خطأ أثناء إنشاء الحساب");
        setLoading(false);
        return;
      }

      // 3️⃣ Fetch player ID (pid)
      const playerRes = await fetch("/api/get-playerInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const playerData = await playerRes.json();
      const playerId = playerData.playerInfo[0].playerid;
      setPid(playerId);

      // 4️⃣ Send OTP
      const otpRes = await fetch("/api/otp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          pid: playerId,
        }),
      });

      if (!otpRes.ok) {
        setMessage("لم يتم إرسال رمز التحقق. حاول مرة أخرى.");
        setLoading(false);
        return;
      }

      setStep("otp");
      setMessage("✔️ تم إرسال رمز التحقق إلى بريدك الإلكتروني");
      setLoading(false);
    } catch (error) {
      console.error(error);
      setMessage("حدث خطأ غير متوقع");
      setLoading(false);
    }
  };

  // -------------------------
  // VERIFY OTP
  // -------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Only digits + check length
    if (!/^\d{4,6}$/.test(otp)) {
      setMessage("⚠️ أدخل رمز مكون من 4 إلى 6 أرقام فقط.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/otp/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        otpCode: otp,
        pid,
      }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      return
    }
    else {
      setMessage("❌ رمز التحقق غير صحيح");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
            <CardDescription>املأ بياناتك ثم أدخل رمز التحقق</CardDescription>
          </CardHeader>

          <CardContent>
            {message && (
              <p className="text-sm text-center text-red-500 mb-3">{message}</p>
            )}

            {/* SUCCESS MESSAGE */}
            {success && (
              <div className="flex justify-center py-8">
                <Card className="w-full max-w-md text-center">
                  <CardHeader>
                    <CardTitle className="text-2xl text-green-600">
                      تم إنشاء الحساب بنجاح
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      يمكنك الآن البدء في استخدام المنصة
                    </p>

                    <Button className="w-full mt-2" onClick={() => router.push("/")}>
                      الذهاب إلى الصفحة الرئيسية
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* SHOW FORM + OTP ONLY IF NOT SUCCESS */}
            {!success && (
              <>
                {/* ------------------ FORM STEP ------------------ */}
                {step === "form" && (
                  <form onSubmit={handleSignup} className="space-y-3">
                    <Label>الاسم الأول</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                    />

                    <Label>الاسم الأخير</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                    />

                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>

                      <PhoneInput
                        country={"sa"}
                        onlyCountries={[
                          "sa",
                          "ae",
                          "qa",
                          "kw",
                          "bh",
                          "om",
                          "jo",
                          "iq",
                          "eg",
                          "lb",
                          "sy",
                          "ye",
                          "ps",
                          "ir",
                          "tr",
                        ]}
                        localization={ar}
                        value={formData.phone}
                        onChange={(value) =>
                          setFormData({ ...formData, phone: value })
                        }
                        placeholder="05XXXXXXXX"
                        containerClass="!w-full"
                        inputClass="
                        !w-full 
                        !h-10
                        !rounded-md 
                        !shadow-sm 
                        !text-sm 
                        !pl-10 
                        !bg-white 
                        !border 
                        !border-gray-300
                        focus:!shadow-blue-300 
                        focus:!border-blue-400
                      "
                      />

                      <input type="hidden" name="phone" value={formData.phone} />
                    </div>

                    <Label>البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />

                    <Button className="w-full" type="submit" disabled={loading}>
                      {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
                    </Button>

                    <p className="text-center text-sm mt-2">
                      لديك حساب بالفعل؟{" "}
                      <Link href="/login" className="text-primary underline">
                        تسجيل الدخول
                      </Link>
                    </p>
                  </form>
                )}

                {/* ------------------ OTP STEP ------------------ */}
                {step === "otp" && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <Label>أدخل رمز التحقق</Label>
                    <Input
                      type="text"
                      value={otp}
                      maxLength={6}
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value)) setOtp(e.target.value);
                      }}
                      required
                    />

                    <Button className="w-full" type="submit" disabled={loading}>
                      {loading ? "جاري التحقق..." : "تحقق"}
                    </Button>
                  </form>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );

}
