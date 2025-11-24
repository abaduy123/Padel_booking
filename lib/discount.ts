
import { sql } from "@/lib/db";



interface Field {
  fieldid: number
  fieldname: string
  fieldcost: number
  fieldtype: string
  description: string
}

export async function fetchFieldsWithDiscounts() {
  try {
    // 1 Fetch all fields
    const fields = (await sql`
  SELECT fieldid, fieldname, fieldcost, fieldtype, description
  FROM public.field
  WHERE deleted = false;
`) as Field[];
    await sql`
          UPDATE public.discount
          SET active = 
          CASE
            WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN TRUE   -- active now
            WHEN end_date < CURRENT_DATE THEN FALSE                                   -- expired
            WHEN start_date > CURRENT_DATE THEN FALSE                                  -- future
            ELSE active
          END
`;


    // 2 Fetch all active discounts (global or specific)
    const discounts = await sql`
      SELECT *
      FROM public.discount
      WHERE active = TRUE
        AND start_date <= CURRENT_DATE
        AND end_date >= CURRENT_DATE
    `;

    //  Apply discounts to each field
    const fieldsWithDiscount = fields.map((field) => {
      const applicableDiscounts = discounts.filter(
        (d) => d.fieldid === null || d.fieldid === field.fieldid
      );

      let finalCost = field.fieldcost;
      let totalPercentage = 0;

      // Apply each discount (stacking)
      applicableDiscounts.forEach((d) => {
        finalCost = finalCost * (1 - d.discount_percentage / 100);
        totalPercentage += d.discount_percentage;
      });

      return {
        ...field,
        original_cost: field.fieldcost,
        final_cost: Math.round(finalCost),
        discounts: applicableDiscounts,
        total_discount_percentage: totalPercentage,
      };
    });

    return fieldsWithDiscount;
  } catch (error) {
    console.error("Discount Fetch Error:", error);
    throw new Error("Failed to fetch discounted fields.");
  }
}
