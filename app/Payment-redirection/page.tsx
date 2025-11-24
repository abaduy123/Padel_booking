import { redirect } from "next/navigation";

export interface PaymobRedirectQuery {
  id: string;
  pending: string; // "true" or "false" (convert to boolean later)
  amount_cents: string;
  success: string;
  is_auth: string;
  is_capture: string;
  is_standalone_payment: string;
  is_voided: string;
  is_refunded: string;
  is_3d_secure: string;
  integration_id: string;
  profile_id: string;
  has_parent_transaction: string;
  order: string;
  created_at: string;
  currency: string;
  merchant_commission: string;
  accept_fees: string;
  discount_details: string;
  is_void: string;
  is_refund: string;
  error_occured: string;
  refunded_amount_cents: string;
  captured_amount: string;
  updated_at: string;
  is_settled: string;
  bill_balanced: string;
  is_bill: string;
  owner: string;
  merchant_order_id: string;
  "data.message"?: string;
  "source_data.type"?: string;
  "source_data.pan"?: string;
  "source_data.sub_type"?: string;
  acq_response_code?: string;
  txn_response_code?: string;
  hmac: string;
}

export default async function Page(props: { searchParams: PaymobRedirectQuery }) {

     const { searchParams } = props;
     const { success } = await searchParams;      
        return (    
            <div>
                {success === "true" ? (
                    redirect('booking/payment-success')
                ) : (
                    redirect('booking/payment-failure')
                )}
            </div>
        );


}