"use client"

import type React from "react"
import handlePayment from "@/lib/handle_payment"
import { useState, useEffect, useMemo } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { CalendarIcon, Clock } from "lucide-react"
import { format, isToday, isBefore, startOfDay } from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "@/lib/utils"
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { OTPVerification } from "@/components/otp-verification"



const afternoonSlots = [
  { value: "16:00", label: "4:00 م" },
  { value: "16:30", label: "4:30 م" },
  { value: "17:00", label: "5:00 م" },
  { value: "17:30", label: "5:30 م" },
  { value: "18:00", label: "6:00 م" },
  { value: "18:30", label: "6:30 م" },
  { value: "19:00", label: "7:00 م" },
  { value: "19:30", label: "7:30 م" },
  { value: "20:00", label: "8:00 م" },
  { value: "20:30", label: "8:30 م" },
  { value: "21:00", label: "9:00 م" },
  { value: "21:30", label: "9:30 م" },
  { value: "22:00", label: "10:00 م" },
  { value: "22:30", label: "10:30 م" },
  { value: "23:00", label: "11:00 م" },
  { value: "23:30", label: "11:30 م" },
]

const midnightSlots = [
  { value: "00:00", label: "12:00 ص" },
  { value: "00:30", label: "12:30 ص" },
  { value: "01:00", label: "1:00 ص" },
  { value: "01:30", label: "1:30 ص" },
  { value: "02:00", label: "2:00 ص" },
  { value: "02:30", label: "2:30 ص" },
  { value: "03:00", label: "3:00 ص" },
  { value: "03:30", label: "3:30 ص" },
  { value: "04:00", label: "4:00 ص" },
]
type BookingClientProps = {
  fields: {
    fieldid: number;
    fieldname: string;
    fieldtype: string;

    original_cost: number;
    final_cost: number;

    discounts: {
      fieldid: number | null;
      discount_percentage: number;
      start_date: string;
      end_date: string;
      active: boolean;
    }[];

    total_discount_percentage: number;
  }[];

  GetForm: (formData: FormData) => Promise<void>;
  session: any;
};



export default function BookingClient({ fields, GetForm, session }: BookingClientProps) {


  const router = useRouter()

  console.log("Fields in BookingClient:", fields);


  const [date, setDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")

  const [firstName, setfirstName] = useState("")
  const [lastName, setlastName] = useState("")
  const [loadingSubmit, setLoadingSubmit] = useState(false)

  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")


  const [phone, setPhone] = useState("")
  const [pid, setPid] = useState("")

  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false)
  const [isTimePopoverOpen, setIsTimePopoverOpen] = useState(false)
  const [showOtpVerification, setShowOtpVerification] = useState(false)

  useEffect(() => {
    if (session) {
      const [first, ...rest] = (session.name || "").split(" ");
      setfirstName(first);
      setlastName(rest.join(" "));
      setEmail(session.email);
      setPhone(session.pnumber);
    }
  }, [session]);

  const getPlayerId = async () => {
    const response = await fetch('/api/get-playerInfo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data.playerInfo[0].playerid;

  }


  const availableAfternoonSlots = useMemo(() => {
    if (!date) return afternoonSlots

    // If selected date is today, filter out past times
    if (isToday(date)) {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      return afternoonSlots.filter((slot) => {
        const [slotHour, slotMinute] = slot.value.split(":").map(Number)

        // Compare hour first, then minutes if same hour
        if (slotHour > currentHour) return true
        if (slotHour === currentHour && slotMinute > currentMinute) return true
        return false
      })
    }

    // If future date, show all slots
    return afternoonSlots
  }, [date])

  const availableMidnightSlots = useMemo(() => {
    if (!date) return midnightSlots

    // If selected date is today, filter out past times
    if (isToday(date)) {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      // If it's 4 AM or later, all midnight slots are for tonight/tomorrow and should be shown
      if (currentHour >= 4) {
        // We're past 4 AM, so all midnight slots are available for tonight
        return midnightSlots
      }

      // We're currently in the midnight period (0-3 AM), so filter out past slots
      return midnightSlots.filter((slot) => {
        const [slotHour, slotMinute] = slot.value.split(":").map(Number)

        // Compare hour first, then minutes if same hour
        if (slotHour > currentHour) return true
        if (slotHour === currentHour && slotMinute > currentMinute) return true
        return false
      })
    }

    // If future date, show all slots
    return midnightSlots
  }, [date])

  useEffect(() => {
    if (selectedTime && date) {
      const allAvailableSlots = [...availableAfternoonSlots, ...availableMidnightSlots]
      const isTimeStillAvailable = allAvailableSlots.some((slot) => slot.label === selectedTime)

      if (!isTimeStillAvailable) {
        setSelectedTime("")
      }
    }
  }, [date, selectedTime, availableAfternoonSlots, availableMidnightSlots])


  if (!fields[0]) {
    return <div>الملعب غير موجود</div>
  }

  const hasDiscount = fields[0].discounts.length > 0;

  const originalPrice = fields[0].original_cost;
  const finalPrice = hasDiscount ? fields[0].final_cost : originalPrice;

  // deposit 20%
  const depositAmount = Math.ceil(finalPrice * 0.2);



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoadingSubmit(true)
    const formData = new FormData(e.currentTarget)
    if (phone.length < 9 || phone.length > 15) {
      setMessage("⚠️ رقم الهاتف غير صالح.");
      setLoadingSubmit(false);
      return;
    }

    await GetForm(formData)
    try {
      const playerId = await getPlayerId()
      setPid(playerId)
      setShowOtpVerification(true)

    } catch (error) {
      console.error("Failed to get player ID:", error)
    } finally {
    if (!showOtpVerification) {
      setLoadingSubmit(false);
    }
    }

  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setIsTimePopoverOpen(false)
  }
  const handleOtpVerified = async () => {
    try {
      const playerId = await getPlayerId()
      await handlePayment(email, phone, firstName, lastName, Math.ceil(depositAmount), fields[0].fieldname, playerId);

    } catch (error) {
      console.error("Failed to start payment session:", error)
    }
  }

  const handleBackFromOtp = () => {
    setShowOtpVerification(false)
  }

  if (showOtpVerification) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="max-w-md w-full mx-4">
            <OTPVerification email={email} pid={pid} onVerified={handleOtpVerified} onBack={handleBackFromOtp} />
          </div>
        </div>
        <Footer />
      </div>
    )
  }




  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2"> {fields[0].fieldname}</h1>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Booking Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>تفاصيل الحجز</CardTitle>
                    <CardDescription>اختر التاريخ والوقت المفضلة</CardDescription>
                  </CardHeader>
                  <CardContent>
                   
                    <form onSubmit={handleSubmit} id="booking-form" className="space-y-6">
                      {/* Date Selection */}
                      <div className="space-y-2">
                        <Label>اختر التاريخ</Label>
                        <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="ml-2 h-4 w-4" />
                              {date ? format(date, "PPP", { locale: ar }) : "اختر تاريخاً"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"

                              selected={date}
                              onSelect={(newDate) => {
                                setDate(newDate)
                                setIsDatePopoverOpen(false)
                              }}
                              disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
                              initialFocus
                              locale={ar}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>اختر الوقت</Label>
                        <Popover open={isTimePopoverOpen} onOpenChange={setIsTimePopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedTime && "text-muted-foreground",
                              )}
                              disabled={!date}
                            >
                              <Clock className="ml-2 h-4 w-4" />
                              {selectedTime || "اختر وقتاً"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-4" align="start">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Clock className="h-4 w-4" />
                                <span>اختر الوقت المناسب</span>
                              </div>

                              {availableAfternoonSlots.length > 0 && (
                                <div className="space-y-2">
                                  <div className="text-xs font-medium text-muted-foreground">بعد العصر</div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {availableAfternoonSlots.map((slot) => (
                                      <Button
                                        key={slot.value}
                                        type="button"
                                        variant={selectedTime === slot.label ? "default" : "outline"}
                                        className={cn(
                                          "h-10 text-sm",
                                          selectedTime === slot.label && "bg-primary text-primary-foreground",
                                        )}
                                        onClick={() => handleTimeSelect(slot.label)}
                                      >
                                        {slot.label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {availableMidnightSlots.length > 0 && (
                                <div className="space-y-2">
                                  <div className="text-xs font-medium text-muted-foreground">بعد منتصف الليل</div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {availableMidnightSlots.map((slot) => (
                                      <Button
                                        key={slot.value}
                                        type="button"
                                        variant={selectedTime === slot.label ? "default" : "outline"}
                                        className={cn(
                                          "h-10 text-sm",
                                          selectedTime === slot.label && "bg-primary text-primary-foreground",
                                        )}
                                        onClick={() => handleTimeSelect(slot.label)}
                                      >
                                        {slot.label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {availableAfternoonSlots.length === 0 && availableMidnightSlots.length === 0 && (
                                <div className="text-center py-4 text-sm text-muted-foreground">
                                  لا توجد أوقات متاحة لهذا التاريخ
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold text-foreground">معلومات الاتصال</h3>

                        <div className="space-y-2">
                          <Label htmlFor="firstname">الاسم الاول</Label>
                          <Input
                            id="firstname"
                            name="firstname"
                            value={firstName}
                            onChange={(e) => setfirstName(e.target.value)}
                            placeholder="أحمد محمد"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastname">الاسم الاخير</Label>
                          <Input
                            id="lastname"
                            name="lastname"
                            value={lastName}
                            onChange={(e) => setlastName(e.target.value)}
                            placeholder="دخيل الروقي"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">البريد الإلكتروني</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ahmed@example.com"
                            required
                          />
                        </div>

                         {message && <p className="text-sm text-center text-red-500 mb-3">{message}</p>}
                        <div className="space-y-2">
                          <Label htmlFor="phone">رقم الهاتف</Label>
                          <PhoneInput

                            country={'sa'}
                            onlyCountries={[
                              'sa', 'ae', 'qa', 'kw', 'bh', 'om', 'jo', 'iq', 'eg',
                              'lb', 'sy', 'ye', 'ps', 'ir', 'tr'
                            ]}
                            localization={ar}

                            value={phone}
                            onChange={(phone) => setPhone(phone)}
                            placeholder="05XXXXXXXX"
                            containerClass="w-full"
                            inputClass="
                              .react-tel-input .selected-flag .arrow
                              .react-tel-input .selected-flag .flag
                              !w-full 
                              !h-8 
                              !rounded-md 
                              !shadow-sm 
                              !shadow-blue-200 
                              !text-sm 
                              !pl-8 
                              !bg-white 
                              !border-0
                              focus:!shadow-blue-300 
                            "

                          />
                          <input type="hidden" name="phone" value={phone} />
                        </div>

                      </div>
                      <input
                        type="hidden"
                        name="date"
                        value={date ? format(date, "yyyy-MM-dd") : ""}
                      />
                      <input type="hidden" name="fieldId" value={fields[0].fieldid} />

                      <input
                        type="hidden"
                        name="time"
                        value={selectedTime}
                      />
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Booking Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>ملخص الحجز</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">المدة</span>
                        <span className="font-medium text-foreground">{fields[0].fieldname}</span>
                      </div>


                      {date && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">التاريخ</span>
                          <span className="font-medium text-foreground">{format(date, "PP", { locale: ar })}</span>
                        </div>
                      )}
                    </div>
                    {selectedTime && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">الوقت</span>
                        <span className="font-medium text-foreground">{selectedTime}</span>
                      </div>
                    )}

                    <div className="border-t pt-4 space-y-3">

                      {/* Final Price (discounted or original) */}
                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">السعر الاجمالي</span>
                        <span className="font-bold text-primary text-lg">
                          {finalPrice} ريال
                        </span>
                      </div>

                      {/* Deposit */}
                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">العربون</span>
                        <span className="font-bold text-blue-600 text-lg">
                          {depositAmount} ريال
                        </span>
                      </div>

                    </div>

                  </CardContent>
                  <CardFooter>
                    <Button

                      form="booking-form"
                      type="submit"
                      disabled={
                        loadingSubmit ||
                        !date ||
                        !firstName ||
                        !lastName ||
                        !email ||
                        !phone ||
                        !selectedTime
                      }
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                    >
                      {loadingSubmit ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 ml-1" />
                          جاري التأكيد…
                        </>
                      ) : (
                        "تأكيد الحجز"
                      )}

                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
