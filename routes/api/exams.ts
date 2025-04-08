import { Handlers } from "$fresh/server.ts";
import { Database } from "../../db/kv.ts";
import { Exam } from "../../db/types.ts";

export const handler: Handlers = {
  async POST(req) {
    const formData = await req.formData();
    const exam: Omit<Exam, "id"> = {
      student_id: formData.get("student_id") as string,
      exam_type: formData.get("exam_type") as string,
      exam_date: formData.get("exam_date") as string,
      result: formData.get("result") as string,
      notes: formData.get("notes") as string || undefined,
    };

    try {
      await Database.createExam(exam);
      return new Response(null, {
        status: 303,
        headers: {
          Location: "/exams",
        },
      });
    } catch (error) {
      console.error("Error creating exam:", error);
      return new Response("Error creating exam", { status: 500 });
    }
  },
}; 