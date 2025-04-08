import { Handlers } from "$fresh/server.ts";
import { Database } from "../../../db/kv.ts";
import { Payment } from "../../../db/types.ts";

export const handler: Handlers = {
  async GET(_req, _ctx) {
    try {
      const [payments, students] = await Promise.all([
        Database.listPayments(),
        Database.listStudents(),
      ]);
      
      return new Response(JSON.stringify({ payments, students }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  async POST(req) {
    const formData = await req.formData();
    const student_id = formData.get("student_id") as string;
    const amount = formData.get("amount") as string;
    const payment_date = formData.get("payment_date") as string;
    const payment_type = formData.get("payment_type") as string;

    if (!student_id || !amount || !payment_date || !payment_type) {
      return new Response("Missing required fields", { status: 400 });
    }

    const payment: Omit<Payment, "id"> = {
      student_id,
      amount,
      payment_date,
      payment_type,
    };

    try {
      await Database.createPayment(payment);
      return new Response(null, {
        status: 303,
        headers: { Location: "/payments" },
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      return new Response("Error creating payment", { status: 500 });
    }
  },
}; 