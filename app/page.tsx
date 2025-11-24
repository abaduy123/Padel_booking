import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FieldCard } from "@/components/field-card"
import { Sparkles } from "lucide-react"
import Image from "next/image"
import { fetchFieldsWithDiscounts } from "@/lib/discount";

export default async function Home() {
  const fields = await fetchFieldsWithDiscounts();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-14 md:py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20 md:opacity-10">
          <Image
            src="/padel-hero-male-athlete.jpg"
            alt="Padel court hero"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl md:max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-5 animate-fade-in-up">
              <Sparkles className="h-4 w-4" />
              <span>احجز ملعبك المثالي</span>
            </div>

            <h1 className="text-3xl md:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
              ملاعب بادل احترافية في متناول يدك
            </h1>

            <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 leading-relaxed">
              استمتع بمرافق بادل عالمية المستوى مع حجز سهل عبر الإنترنت.
              اختر ملعبك المناسب واحجز الآن خلال ثوانٍ.
            </p>
          </div>
        </div>
      </section>

      {/* Fields Section */}
      <section id="fields" className="py-12 md:py-16 px-4 md:px-12">
        <div className="container mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
              الملاعب المتاحة
            </h2>
            <p className="text-muted-foreground max-w-xl md:max-w-2xl mx-auto text-sm md:text-base px-3">
              تصفح مجموعتنا من ملاعب البادل الممتازة. جميع الملاعب مجهزة ومعدة
              لتمنحك أفضل تجربة لعب.
            </p>
          </div>

          {/* Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {fields.map((field) => (
              <FieldCard
                key={String(field.fieldid)}
                id={String(field.fieldid)}
                name={field.fieldname}
                image={
                  field.fieldtype === "m"
                    ? "/padel-male-blue.jpg"
                    : "/padel-female-pink-removebg-preview.png"
                }
                type={field.fieldtype === "m" ? "ملعب رجالي" : "ملعب نسائي"}
                originalprice={field.original_cost}
                discountedprice={field.final_cost}
                description={field.description}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
