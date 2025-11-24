"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function MyReservationsPage() {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/my-reservations");
        const data = await res.json();
        setReservations(data.reservations || []);
      } catch (err) {
        console.error("Failed to fetch reservations", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#eef6ff] p-6 flex justify-center">
        {loading && (
          <div className="flex flex-col items-center justify-center mt-24">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-blue-700 font-semibold">
              جارِ التحميل...
            </p>
          </div>
        )}

        {!loading && reservations.length === 0 && (
          <div className="text-center text-xl font-semibold mt-20 text-gray-700">
            لا يوجد حجوزات
          </div>
        )}

        {!loading && reservations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
            {reservations.map((r: any) => (
              <ReservationCard key={r.reservationid} reservation={r} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("ar", {
    calendar: "gregory",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(dateString));
}

function ReservationCard({ reservation }: any) {
  const isMale = reservation.fieldtype === "m";
  const dateFormatted = formatDate(reservation.rdate);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex flex-col items-center">
        <img
          src={
            isMale
              ? "/padel-male-blue.jpg"
              : "/padel-female-pink-removebg-preview.png"
          }
          alt="Field"
          className="w-40 drop-shadow-sm"
        />

        <h2 className="text-2xl font-bold mt-3 text-blue-700">
          {reservation.fieldname}
        </h2>

        <p className="text-blue-500 font-medium mt-1">
          {isMale ? "ملعب رجالي" : "ملعب نسائي"}
        </p>

        <div className="mt-4 text-right w-full text-gray-700 space-y-1 text-[15px]">
          <p><span className="font-semibold text-blue-700">اسم الحاجز:</span> {reservation.playername}</p>
          <p><span className="font-semibold text-blue-700">السعر:</span> {reservation.reservation_cost} ريال</p>
          <p><span className="font-semibold text-blue-700">التاريخ:</span> {dateFormatted}</p>
          <p><span className="font-semibold text-blue-700">الوقت:</span> {reservation.rtime}</p>
          <p><span className="font-semibold text-blue-700">الحالة:</span> {reservation.status}</p>
        </div>
      </div>
    </div>
  );
}
