"use client";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Calendar, Tag, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";


type Field = {
  fieldid: number;
  fieldname: string;
};

type DiscountRow = {
  discountid: number;
  fieldid: number | null;
  discount_percentage: number;
  start_date: string; // ISO date
  end_date: string; // ISO date
  active: boolean;
};

export default function DiscountsManagement() {

  const [discounts, setDiscounts] = useState<DiscountRow[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const today = new Date().toISOString().split("T")[0];



  const [form, setForm] = useState<Partial<DiscountRow>>({
    discount_percentage: 10,
    fieldid: null,
    start_date: "",
    end_date: "",
    active: true,
  });

  const { toast } = useToast();

  // load fields and discounts
  const load = async () => {
    try {
      setLoadingPage(true);
      const [fRes, dRes] = await Promise.all([
        fetch("/api/admin-fields/get-fields"),
        fetch("/api/discounts/get-all"),
      ]);

      if (fRes.status === 401 || dRes.status === 401) {
        toast({
          title: "غير مصرح",
          description: "انتهت جلستك، الرجاء تسجيل الدخول مرة أخرى.",
          variant: "destructive",
        });

        window.location.href = "/adminLogin"; // redirect to login
        return;
      }

      if (!fRes.ok) throw new Error("failed fetch fields");
      if (!dRes.ok) throw new Error("failed fetch discounts");

      const fJson = await fRes.json();
      const dJson = await dRes.json();

      setFields(fJson);
      setDiscounts(dJson);
    } catch (err) {
      toast({ title: "خطأ", description: "فشل جلب البيانات" });
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ discount_percentage: 10, fieldid: null, start_date: "", end_date: "", active: true });
    setIsDialogOpen(true);
  };

  const openEdit = (d: DiscountRow) => {
    setEditing(d);
    setForm({
      discount_percentage: d.discount_percentage,
      fieldid: d.fieldid,
      start_date: d.start_date,
      end_date: d.end_date,
      active: d.active,
      discountid: d.discountid,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (discountid: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخصم؟")) return;
    setActionLoadingId(discountid);
    try {

      const res = await fetch("/api/discounts/delete", {
        method: "DELETE",
        body: JSON.stringify({ discountid }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "خطأ", description: json?.error || "فشل الحذف" });
        return;
      }
      setDiscounts((p) => p.filter((r) => r.discountid !== discountid));
      toast({ title: "تم الحذف", description: "تم حذف الخصم بنجاح" });
    } catch {
      toast({ title: "خطأ", description: "فشل الاتصال" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    // quick client-side sanity
    if (!form.start_date || !form.end_date || !form.discount_percentage) {
      toast({ title: "خطأ", description: "يجب تعبئة كل الحقول" });
      return;
    }

    try {
      setLoading(true);

      if (editing) {
        // update
        const res = await fetch("/api/discounts/update", {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!res.ok) {
          toast({ title: "خطأ", description: json?.error || "فشل التحديث" });
          setLoading(false);
          return;
        }
        setDiscounts((prev) => prev.map((p) => (p.discountid === json.discountid ? json : p)));
        toast({ title: "تم التحديث", description: "تم تحديث الخصم" });
      } else {
        // create
        const res = await fetch("/api/discounts/create", {
          method: "POST",
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!res.ok) {
          toast({ title: "خطأ", description: json?.error || "فشل الإنشاء" });
          setLoading(false);
          return;
        }
        setDiscounts((prev) => [...prev, json]);
        toast({ title: "تمت الإضافة", description: "تم إضافة الخصم" });
      }

      setIsDialogOpen(false);
    } catch {
      toast({ title: "خطأ", description: "فشل الاتصال بالخادم" });
    } finally {
      setLoading(false);
    }
  };

  const getName = (fieldid: number | null) => {
    if (fieldid === null) return "جميع الملاعب";
    return fields.find((f) => f.fieldid === fieldid)?.fieldname ?? "غير معروف";
  };

  const isExpired = (end: string) => new Date(end) < new Date();

  if (loadingPage) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
   

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">إدارة الخصومات</h1>
          <p className="text-muted-foreground">إضافة وتعديل وحذف الخصومات</p>
        </div>
        <Button onClick={openCreate} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" /> إضافة خصم جديد
        </Button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {discounts.map((d) => {
          const expired = isExpired(d.end_date);
          return (
            <Card key={d.discountid} className={expired ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Percent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{d.discount_percentage}%</CardTitle>
                      <div className="text-sm text-muted-foreground">{getName(d.fieldid)}</div>
                    </div>
                  </div>

                  <Badge variant={expired ? "destructive" : d.active ? "default" : "secondary"}>
                    {expired ? "منتهي" : d.active ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>من: {format(d.start_date, "PP", { locale: ar })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>إلى: {format(d.end_date, "PP", { locale: ar })}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => openEdit(d)}
                    variant="outline"
                    className="flex-1 gap-2 cursor-pointer disabled:cursor-not-allowed"
                    disabled={actionLoadingId === d.discountid}
                  >
                    {actionLoadingId === d.discountid ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Pencil className="h-4 w-4" /> تعديل</>}
                  </Button>


                  <Button
                    onClick={() => handleDelete(d.discountid)}
                    variant="destructive"
                    disabled={actionLoadingId === d.discountid}
                    className="flex-1 gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {actionLoadingId === d.discountid ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" /> حذف
                      </>
                    )}
                  </Button>
                </div>

              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل الخصم" : "إضافة خصم جديد"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitForm} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>نسبة الخصم (%)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={form.discount_percentage ?? ""}
                  onChange={(e) => setForm({ ...form, discount_percentage: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label>الملعب</Label>
                <Select
                  value={form.fieldid === null ? "all" : String(form.fieldid)}
                  onValueChange={(v) => setForm({ ...form, fieldid: v === "all" ? null : Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الملاعب</SelectItem>
                    {fields.map((f) => (
                      <SelectItem key={f.fieldid} value={String(f.fieldid)}>
                        {f.fieldname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>تاريخ البداية</Label>
                <Input
                  type="date"
                  value={form.start_date ?? ""}
                  min={today}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>تاريخ النهاية</Label>
                <Input
                  type="date"
                  value={form.end_date ?? ""}
                  min={today}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="cursor-pointer">
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editing ? "حفظ التعديلات" : "إضافة الخصم")}
              </Button>
            </div>

          </form>
        </DialogContent>
      </Dialog>
    </div>
  );

}
