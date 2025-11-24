"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MapPin, Tag, Calendar, LogOut, X } from "lucide-react";

const navItems = [
  {
    title: "إدارة الملاعب",
    href: "/admin/fields",
    icon: MapPin,
  },
  {
    title: "إدارة الخصومات",
    href: "/admin/discounts",
    icon: Tag,
  },
  {
    title: "إدارة الحجوزات",
    href: "/admin/reservations",
    icon: Calendar,
  },
];

export function AdminSidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed md:static top-0 right-0 h-full w-64 bg-card border-l border-border flex flex-col z-50 transform transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full md:translate-x-0",
        )}
      >
        {/* Mobile close button */}
        <div className="md:hidden flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">القائمة</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 border-b border-border hidden md:block">
          <h2 className="text-xl font-bold text-foreground">لوحة الإدارة</h2>
          <p className="text-sm text-muted-foreground mt-1">حجز ملاعب البادل</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
                onClick={() => setOpen(false)} // close on mobile
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            onClick={() => setOpen(false)}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">العودة للموقع</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
