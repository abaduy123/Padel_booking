"use client";

import React, { useEffect, useState } from "react";

import AdminLoginForm from "../adminLogin/page";


export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
 

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin_page");
        if (res.ok) {
          const data = await res.json();
          setAuthorized(data.authorized);
        } else {
          setAuthorized(false);
        }
      } catch {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) return <div className="p-8">جارٍ التحقق...</div>;
  if (!authorized) return <AdminLoginForm />;

  return (
    <div className="p-8">
     

     
    </div>
  );
}
