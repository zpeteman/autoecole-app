import { Handlers } from "$fresh/server.ts";
import { Database } from "../../../db/kv.ts";
import { Exam, Student } from "../../../db/types.ts";

export const handler: Handlers = {
  async GET(_req, _ctx) {
    try {
      const [exams, students] = await Promise.all([
        Database.listExams(),
        Database.listStudents(),
      ]);
      
      return new Response(JSON.stringify({ exams, students }), {
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
    const exam_type = formData.get("exam_type") as string;
    const exam_date = formData.get("exam_date") as string;
    const result = formData.get("result") as string;
    const notes = formData.get("notes") as string;

    if (!student_id || !exam_type || !exam_date || !result) {
      return new Response("Missing required fields", { status: 400 });
    }

    const exam: Omit<Exam, "id"> = {
      student_id,
      exam_type,
      exam_date,
      result,
      notes: notes || undefined,
    };

    try {
      await Database.createExam(exam);
      return new Response(null, {
        status: 303,
        headers: { Location: "/exams" },
      });
    } catch (error) {
      console.error("Error creating exam:", error);
      return new Response("Error creating exam", { status: 500 });
    }
  },
}; 