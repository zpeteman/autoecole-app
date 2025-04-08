import { Handlers } from "$fresh/server.ts";
import { Database } from "../../../db/kv.ts";
import { Payment } from "../../../db/types.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    return await handlePaymentUpdate(req, ctx.params.id);
  },
  async PUT(req, ctx) {
    return await handlePaymentUpdate(req, ctx.params.id);
  },
};

async function handlePaymentUpdate(req: Request, id: string) {
  const formData = await req.formData();

  const payment = await Database.getPayment(id);
  if (!payment) {
    return new Response("Payment not found", { status: 404 });
  }

  const updatedPayment: Partial<Payment> = {
    amount: formData.get("amount") as string,
    payment_date: formData.get("payment_date") as string,
    payment_type: formData.get("payment_type") as "cash" | "card",
    notes: formData.get("notes") as string,
  };

  try {
    await Database.updatePayment(id, updatedPayment);
    return new Response(null, {
      status: 303,
      headers: { Location: "/payments" },
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return new Response("Error updating payment", { status: 500 });
  }
} 