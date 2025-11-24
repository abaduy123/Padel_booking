"use client";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";


interface Field {
  fieldid: number;
  description: string
  fieldname: string;
  fieldtype: string;
  fieldcost: number;
  original_cost?: number;
  final_cost?: number;
  total_discount_percentage?: number;
}

export default function FieldsManagement() {

  const [fields, setFields] = useState<Field[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [loadingFields, setLoadingFields] = useState(true);

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Field>>({
    fieldname: "",
    fieldtype: "",
    description: "",
    fieldcost: 0,
  });

  const { toast } = useToast();

  // Fetch fields on mount
  const fetchFields = async () => {
    
    try {
      setLoadingFields(true);

      const res = await fetch("/api/admin-fields/get-fields");
      const data = await res.json();
      if (res.status === 401) {
        toast({
          title: "غير مصرح",
          description: "يجب تسجيل الدخول كمسؤول للوصول لهذه الصفحة",
          variant: "destructive"
        });

        // redirect to login
        window.location.href = "/adminLogin";
        return;
      }

      setFields(data);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل جلب الملاعب" });
    } finally {
    setLoadingFields(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  // Open dialog for new field
  const handleAdd = () => {
    setEditingField(null);
    setFormData({ fieldname: "", fieldtype: "", fieldcost: 0, description: "" });
    setIsDialogOpen(true);
  };

  // Open dialog for edit
  const handleEdit = (field: Field) => {
    setEditingField(field);
    setFormData(field);
    setIsDialogOpen(true);
  };

  // Submit add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!formData.fieldname || !formData.fieldtype || !formData.fieldcost || !formData.description) {
      toast({
        title: "خطأ",
        description: "يجب تعبئة جميع الحقول قبل الحفظ",
      });
      return;
    }
    setSubmitLoading(true);

    try {
      if (editingField) {
        const res = await fetch("/api/admin-fields/edit-fields", {
          method: "PATCH",
          body: JSON.stringify({
            fieldid: editingField.fieldid,
            ...formData,
          }),
        });
        const updated = await res.json();
        setFields((prev) =>
          prev.map((f) => (f.fieldid === updated.fieldid ? updated : f))
        );
        toast({ title: "تم التحديث", description: "تم تحديث الملعب بنجاح" });
      } else {
        const res = await fetch("/api/admin-fields/insert-field", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        const newField = await res.json();
        setFields((prev) => [...prev, newField]);
        toast({ title: "تمت الإضافة", description: "تم إضافة الملعب بنجاح" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل حفظ البيانات" });
    }
    setSubmitLoading(false);
  };

  // Delete field
  const handleDelete = async (fieldid: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الملعب؟ لا يمكن التراجع عن العملية.")) return;
    setActionLoadingId(fieldid);
    try {
      const res = await fetch("/api/admin-fields/delete-field", {
        method: "DELETE",
        body: JSON.stringify({ fieldid }),
      });

      const data = await res.json();

      //  backend error
      if (!res.ok || data.error) {
        toast({
          title: "لا يمكن الحذف",
          description: data.error || "حدث خطأ غير متوقع.",
          variant: "destructive",
        });
        setActionLoadingId(null);
        return;
      }

      //  success
      setFields((prev) => prev.filter((f) => f.fieldid !== fieldid));
      toast({
        title: "تم الحذف",
        description: "تم حذف الملعب بنجاح.",
      });

    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف الملعب.",
        variant: "destructive",
      });
    }
    setActionLoadingId(null);
  };

  if (loadingFields) {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">إدارة الملاعب</h1>
          <p className="text-muted-foreground">إضافة وتعديل وحذف الملاعب</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة ملعب جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field) => (
          <Card key={field.fieldid} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">{field.fieldname}</CardTitle>
              <div className="text-sm text-muted-foreground">{field.fieldtype === "m" ? "ملعب رجالي" : "ملعب نسائي"}</div>
              <div className="text-sm text-muted-foreground">{field.description}</div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-primary">
                  {field.total_discount_percentage && field.total_discount_percentage > 0
                    ? `${field.final_cost} ريال`
                    : `${field.fieldcost} ريال`}
                </span>
                {field.original_cost &&
                  field.final_cost &&
                  field.original_cost > field.final_cost && (
                    <span className="text-sm text-green-600 font-semibold">
                      خصم %{Math.round(((field.original_cost - field.final_cost) / field.original_cost) * 100)}
                    </span>
                  )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(field)}
                  variant="outline"
                  className="flex-1 gap-2 cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                  تعديل
                </Button>

                <Button
                  onClick={() => handleDelete(field.fieldid)}
                  variant="destructive"
                  disabled={actionLoadingId === field.fieldid}
                  className="flex-1 gap-2 cursor-pointer"
                >
                  {actionLoadingId === field.fieldid ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </>
                  )}
                </Button>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingField ? "تعديل الملعب" : "إضافة ملعب جديد"}</DialogTitle>
            <DialogDescription>
              {editingField ? "قم بتعديل بيانات الملعب" : "أدخل بيانات الملعب الجديد"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fieldname">المدة</Label>
              <Input
                id="fieldname"
                value={formData.fieldname || ""}
                onChange={(e) => setFormData({ ...formData, fieldname: e.target.value })}
                placeholder="مدة اللعب"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">المزايا</Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="مزايا الملعب"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldtype">نوع الملعب</Label>
              <select
                id="fieldtype"
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground"
                value={formData.fieldtype || ""}
                onChange={(e) => setFormData({ ...formData, fieldtype: e.target.value })}
                required
              >
                <option value="">اختر النوع</option>
                <option value="m">رجالي</option>
                <option value="f">نسائي</option>
              </select>
            </div>


            <div className="space-y-2">
              <Label htmlFor="fieldcost">السعر (ريال / ساعة)</Label>
              <Input
                id="fieldcost"
                type="number"
                value={formData.fieldcost}
                onChange={(e) => setFormData({ ...formData, fieldcost: Number(e.target.value) })}
                placeholder="450"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" className="cursor-pointer" variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitLoading} className="cursor-pointer">
                {submitLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  editingField ? "حفظ التعديلات" : "إضافة الملعب"
                )}
              </Button>

            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );

}
