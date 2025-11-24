"use client";
import type React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile top bar */}
      <div className="md:hidden p-4 border-b flex items-center justify-between bg-card">
        <h2 className="text-lg font-bold">لوحة الإدارة</h2>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md border hover:bg-secondary"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Main layout: sidebar + content */}
      <div className="flex flex-1">
        <AdminSidebar open={open} setOpen={setOpen} />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Add page header (optional) */}
          <h1 className="text-2xl font-bold mb-4">مرحبًا بك في لوحة التحكم</h1>
          <p className="text-muted-foreground mb-6">
            هنا يمكنك إدارة الملاعب، الخصومات، و الحجوزات بسهولة.
          </p>

          {children}
        </main>
      </div>
    </div>
  );
}
