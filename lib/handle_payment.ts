
export default async function handlePayment (email: string, phone: string, firstName: string,lastName:string, amount: number, fieldName: string, playerId: number) {
  
 try {
  
 const res = await fetch("/api/paymob", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      phone,
      firstName,
      lastName,
      amount,
      fieldName,
      playerId,
      
    }),
  });

  const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Failed to initiate payment.");
    }
    else {
    
    window.location.href = data.checkoutUrl; 
    }
    
 } catch (error) {
    console.error("Payment API Error:", error);
    throw new Error("Failed to initiate payment.");
  }
  
  
};


