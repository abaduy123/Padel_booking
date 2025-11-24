"use client";

import { Calendar, Mail, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border bg-card mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">حجز البادل</span>
            </div>
            <p className="text-sm text-muted-foreground">
              احجز ملعب البادل المثالي بسهولة. مرافق احترافية للاعبين من جميع المستويات.
            </p>
          </div>

          {/* Contact + Payment Methods */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">تواصل معنا</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span dir="ltr">0555555555</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@padelbook.com</span>
              </li>
            </ul>

            {/* Payment Methods */}
            <h3 className="font-semibold text-foreground mt-6 mb-3">طرق الدفع</h3>

            <div className="flex items-center gap-4">
              <div className="bg-white rounded-md p-2 shadow-sm flex items-center justify-center h-10 w-16">
                <Image src="/visa1.png" alt="Visa" width={50} height={30} className="object-contain" />
              </div>

              <div className="bg-white rounded-md p-2 shadow-sm flex items-center justify-center h-10 w-16">
                <Image src="/mastercard3.png" alt="Mastercard" width={50} height={30} className="object-contain" />
              </div>

              <div className="bg-white rounded-md p-2 shadow-sm flex items-center justify-center h-10 w-16">
                <Image src="/mada1.png" alt="Mada" width={50} height={30} className="object-contain" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 حجز البادل. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
