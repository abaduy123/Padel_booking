// app/(admin)/reservations/page.tsx  (or wherever your admin UI lives)
"use client";
import { Loader2 } from "lucide-react";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, CheckCircle2, XCircle, Clock, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";


type ReservationRow = {
  reservationid: number;
  pid: number;
  playername: string;
  email: string;
  pnumber: string;
  fid: number;
  rfieldname: string;
  fieldcost: number;
  rdate: string; // date string
  rtime: string;
  status: string;
  reservation_cost: number;
};

const STATUS_PENDING = "قيد الانتظار";
const STATUS_DEPOSIT_PAID = "تم دفع العربون";
const STATUS_PAYMENT_FULL = "تم دفع المبلغ كاملا";
const STATUS_REFUNDED = "تم ارجاع المبلغ للعميل";

export default function ReservationsManagement() {


  const [rows, setRows] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ReservationRow | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const refreshTimerRef = useRef<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reservations");
      if (!res.ok) {
        if (res.status === 401) {
          toast({ title: "غير مصرح", description: "انتهت صلاحية تسجيل الدخول." });
          window.location.href = "/adminLogin";
          return;
        }
        throw new Error("Fetch failed");
      }
      const json = await res.json();
      setRows(json);
    } catch (err) {
      console.error(err);
      toast({ title: "خطأ", description: "فشل جلب الحجوزات" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // auto refresh every 5 minutes
    refreshTimerRef.current = window.setInterval(fetchData, 10 * 60 * 1000);
    return () => {
      if (refreshTimerRef.current) window.clearInterval(refreshTimerRef.current);
    };
  }, []);

  const openDetails = (r: ReservationRow) => {
    setSelected(r);
    setDialogOpen(true);
  };

  const closeDetails = () => {
    setSelected(null);
    setDialogOpen(false);
  };

  const canPromoteFromDeposit = (r: ReservationRow) => r.status === STATUS_DEPOSIT_PAID;

  const handleStatusUpdate = async (reservationid: number, newStatus: string) => {
    if (!confirm(`هل أنت متأكد من تغيير الحالة إلى: ${newStatus} ؟`)) return;
    setActionLoadingId(reservationid);
    setActionLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationid, newStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "خطأ", description: json?.error || "فشل تحديث الحالة" });
        return;
      }
      // apply change locally
      setRows((prev) => prev.map((r) => (r.reservationid === reservationid ? { ...r, status: newStatus } : r)));
      if (selected && selected.reservationid === reservationid) {
        setSelected({ ...selected, status: newStatus });
      }
      toast({ title: "تم التحديث", description: "تم تغيير حالة الحجز" });
    } catch (err) {
      console.error(err);
      toast({ title: "خطأ", description: "فشل الاتصال بالخادم" });
    } finally {
      setActionLoadingId(null);
      setActionLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesSearch =
        !s ||
        r.playername?.toLowerCase().includes(s) ||
        r.email?.toLowerCase().includes(s) ||
        r.rfieldname?.toLowerCase().includes(s) ||
        String(r.reservationid).includes(s);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const stats = {
    total: rows.length,
    pending: rows.filter((r) => r.status === STATUS_PENDING).length,
    depositPaid: rows.filter((r) => r.status === STATUS_DEPOSIT_PAID).length,
    paidFull: rows.filter((r) => r.status === STATUS_PAYMENT_FULL).length,
    refunded: rows.filter((r) => r.status === STATUS_REFUNDED).length,
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case STATUS_PENDING:
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> قيد الانتظار</Badge>;
      case STATUS_DEPOSIT_PAID:
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> تم دفع العربون</Badge>;
      case STATUS_PAYMENT_FULL:
        return <Badge className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" /> تم دفع المبلغ كاملا</Badge>;
      case STATUS_REFUNDED:
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> تم ارجاع المبلغ للعميل</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">إدارة الحجوزات</h1>
        <p className="text-muted-foreground">عرض وحفظ حالة الحجوزات — تُحدّث كل 10 دقائق تلقائياً</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
        <Card><CardHeader><CardTitle>إجمالي</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>قيد الانتظار</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{stats.pending}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>دُفع العربون</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.depositPaid}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>دُفع كامل</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.paidFull}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>مُعيد</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats.refunded}</div></CardContent></Card>
      </div>

      {/* filters */}
      <div className="mb-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث باسم العميل، البريد، رقم الحجز، أو الملعب" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="w-52">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(String(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value={STATUS_PENDING}>قيد الانتظار</SelectItem>
                <SelectItem value={STATUS_DEPOSIT_PAID}>تم دفع العربون</SelectItem>
                <SelectItem value={STATUS_PAYMENT_FULL}>تم دفع المبلغ كاملا</SelectItem>
                <SelectItem value={STATUS_REFUNDED}>تم ارجاع المبلغ للعميل</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button onClick={fetchData} disabled={loading} className="cursor-pointer">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تحديث"}
            </Button>
          </div>
        </div>
      </div>

      {/* table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>الهاتف / البريد</TableHead>
                    <TableHead>الملعب</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الوقت</TableHead>
                    <TableHead>السعر الاجمالي (ريال)</TableHead>
                    <TableHead>المبلغ المتبقي دفعه</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.reservationid}>
                      <TableCell>#{r.reservationid}</TableCell>
                      <TableCell>{r.playername}</TableCell>
                      <TableCell className="text-sm">{r.pnumber} / {r.email}</TableCell>
                      <TableCell>{r.rfieldname}</TableCell>
                      <TableCell>{format(new Date(r.rdate), "PPP", { locale: ar })}</TableCell>
                      <TableCell>{r.rtime}</TableCell>
                      <TableCell className="font-semibold">
                        {(r.reservation_cost ?? r.fieldcost)} ريال
                      </TableCell>

                      <TableCell className="font-semibold">
                        {r.status === STATUS_DEPOSIT_PAID
                          ? Math.round(r.reservation_cost * 0.8) + " ريال"
                          : "-"}
                      </TableCell>

                      <TableCell>{statusBadge(r.status)}</TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openDetails(r)}>
                            <Eye className="h-4 w-4" /> عرض
                          </Button>

                          {canPromoteFromDeposit(r) && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleStatusUpdate(r.reservationid, STATUS_PAYMENT_FULL)
                                }
                                disabled={actionLoadingId === r.reservationid}
                              >
                                {actionLoadingId === r.reservationid
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : "دفع كامل"}
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleStatusUpdate(r.reservationid, STATUS_REFUNDED)
                                }
                                disabled={actionLoadingId === r.reservationid}
                              >
                                {actionLoadingId === r.reservationid
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : "ارجاع"}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {filtered.map((r) => (
                <Card key={r.reservationid} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg">#{r.reservationid}</h2>
                    {statusBadge(r.status)}
                  </div>

                  <div className="space-y-1 text-sm">
                    <p><span className="font-semibold">العميل:</span> {r.playername}</p>
                    <p><span className="font-semibold">الجوال:</span> {r.pnumber}</p>
                    <p><span className="font-semibold">البريد:</span> {r.email}</p>
                    <p><span className="font-semibold">الملعب:</span> {r.rfieldname}</p>
                    <p><span className="font-semibold">التاريخ:</span> {format(new Date(r.rdate), "PPP", { locale: ar })}</p>
                    <p><span className="font-semibold">الوقت:</span> {r.rtime}</p>
                    <p><span className="font-semibold">السعر:</span> {(r.reservation_cost ?? r.fieldcost)} ريال</p>
                    <p><span className="font-semibold">المتبقي:</span>
                      {r.status === STATUS_DEPOSIT_PAID
                        ? Math.round(r.reservation_cost * 0.8) + " ريال"
                        : "-"}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => openDetails(r)}>
                      <Eye className="h-4 w-4" /> عرض
                    </Button>

                    {canPromoteFromDeposit(r) && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleStatusUpdate(r.reservationid, STATUS_PAYMENT_FULL)
                          }
                          disabled={actionLoadingId === r.reservationid}
                        >
                          دفع كامل
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleStatusUpdate(r.reservationid, STATUS_REFUNDED)
                          }
                          disabled={actionLoadingId === r.reservationid}
                        >
                          ارجاع
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>

          </CardContent>
        </Card>
      )}
      {/* details dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الحجز #{selected?.reservationid}</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">العميل</div>
                  <div className="font-medium">{selected.playername}</div>
                  <div className="text-sm">{selected.pnumber}</div>
                  <div className="text-sm">{selected.email}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">الملعب</div>
                  <div className="font-medium">{selected.rfieldname}</div>
                  <div className="text-sm">سعر الساعة: {selected.fieldcost} ريال</div>

                  <div className="text-sm">سعر الحجز: {(selected.reservation_cost)} ريال</div>
                  <div className="text-sm">
                    المبلغ المتبقي:{" "}
                    {selected.status === STATUS_DEPOSIT_PAID
                      ? Math.round(selected.reservation_cost * 0.8) + " ريال"
                      : "-"}
                  </div>



                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">تاريخ اللعب</div>
                  <div className="font-medium">{format(new Date(selected.rdate), "PPP", { locale: ar })}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">الوقت</div>
                  <div className="font-medium">{selected.rtime}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">الحالة الحالية</div>
                <div className="mt-2">{statusBadge(selected.status)}</div>
              </div>

              {/* status change controls (only allowed when deposit paid) */}
              <div>
                <div className="text-sm text-muted-foreground">تغيير الحالة</div>
                <div className="flex gap-2 mt-2">
                  <Button
                    disabled={!canPromoteFromDeposit(selected) || actionLoading}
                    onClick={() =>
                      handleStatusUpdate(selected.reservationid, STATUS_PAYMENT_FULL)
                    }
                    className="cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "تم دفع المبلغ كاملا"
                    )}
                  </Button>

                  <Button
                    disabled={!canPromoteFromDeposit(selected) || actionLoading}
                    variant="destructive"
                    onClick={() =>
                      handleStatusUpdate(selected.reservationid, STATUS_REFUNDED)
                    }
                    className="cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "تم ارجاع المبلغ للعميل"
                    )}
                  </Button>

                </div>
                {!canPromoteFromDeposit(selected) && (
                  <div className="text-xs text-muted-foreground mt-2">يمكن تغيير الحالة هنا فقط إن كانت الحالة الحالية "تم دفع العربون".</div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={closeDetails} className="cursor-pointer">إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );


}
