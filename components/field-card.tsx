"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Clock, Loader2 } from "lucide-react"
import { useState } from "react"

interface FieldCardProps {
  id: string
  name: string
  image: string
  discountedprice: number
  originalprice: number
  type: string
  description: string
}

export function FieldCard({
  id,
  name,
  image,
  discountedprice,
  originalprice,
  type,
  description
}: FieldCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = (e: any) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate page navigation delay
    setTimeout(() => {
      window.location.href = `/booking/${id}`
      setIsLoading(false)
    }, 200) // small delay to show loader
  }

  const hasDiscount = discountedprice < originalprice

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 
                     rounded-xl border w-full max-w-full">
      
      {/* Responsive Image */}
      <div className="relative h-40 sm:h-48 w-full overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-contain sm:object-contain group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      <CardContent className="p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">{name}</h3>

        {/* Time */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>متاح من 4:00 مساءً - 4:00 صباحاً</span>
        </div>

        {/* Type */}
        <p className="text-sm text-muted-foreground mt-1">{type}</p>

        {/* Description */}
        <div>
          <span className="font-bold text-black">المزايا: </span>
          <span className="text-sm text-muted-foreground mt-1">{description}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 sm:p-5 pt-0 flex items-center justify-between">
        {/* Price Section */}
        <div className="flex flex-col">
          {!hasDiscount && (
            <>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                {originalprice} ريال
              </p>
              <p className="text-xs text-muted-foreground">للساعة</p>
            </>
          )}

          {hasDiscount && (
            <>
              <div className="flex items-center gap-2">
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  {discountedprice} ريال
                </p>
                <p className="text-sm line-through text-muted-foreground">
                  {originalprice} ريال
                </p>
              </div>

              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium mt-1">
                خصم {Math.round(((originalprice - discountedprice) / originalprice) * 100)}%
              </span>

              <p className="text-xs text-muted-foreground mt-1">للساعة</p>
            </>
          )}
        </div>

        {/* Button */}
        <Button
          onClick={handleClick}
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground 
                     min-w-[100px] sm:min-w-[110px] py-2 sm:py-3 rounded-lg hover:cursor-pointer flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 ml-1" />
              جاري التحميل…
            </>
          ) : (
            "احجز الآن"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
