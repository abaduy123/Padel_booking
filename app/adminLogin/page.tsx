"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/a-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "حدث خطأ أثناء تسجيل الدخول");
        return;
      }

      // Successful login, redirect to admin dashboard
      router.push("/admin/reservations");
    } catch (err) {
      console.error("[Admin Login Error]", err);
      setMessage("حدث خطأ داخلي في الخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">تسجيل الدخول لمسؤول النظام</CardTitle>
            <CardDescription>أدخل بريدك الإلكتروني وكلمة المرور</CardDescription>
          </CardHeader>
          <CardContent>
            {message && <p className="text-sm text-center text-red-500 mb-3">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <Label>كلمة المرور</Label>
              <Input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
                disabled={loading}
              />
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "تسجيل الدخول"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
     
    </div>
  );
}
