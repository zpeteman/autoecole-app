import { Handlers } from "$fresh/server.ts";
import { Database } from "../../../db/kv.ts";
import { Student } from "../../../db/types.ts";

async function saveImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = new Uint8Array(bytes);
  
  // Convert image to base64
  const base64 = btoa(String.fromCharCode(...buffer));
  const imageId = crypto.randomUUID();
  
  // Store in Deno KV
  await Database.kv.set(["images", imageId], {
    name: file.name,
    type: file.type,
    data: base64
  });
  
  // Return the image ID that can be used to fetch the image later
  return imageId;
}

export const handler: Handlers = {
  async POST(req, ctx) {
    const oldId = ctx.params.id;
    const formData = await req.formData();
    const newId = formData.get("id") as string;
    
    // Handle image upload
    let image_url: string | undefined;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      try {
        image_url = await saveImage(imageFile);
        console.log("Image saved successfully:", image_url);
      } catch (error) {
        console.error("Error saving image:", error);
        // Continue without image if there's an error
      }
    }

    // Get the existing student
    const existingStudent = await Database.getStudent(oldId);
    if (!existingStudent) {
      return new Response("Student not found", { status: 404 });
    }

    // Prepare the updated student data
    const updatedStudent: Partial<Student> = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      national_id: formData.get("national_id") as string,
      status: formData.get("status") as "active" | "inactive",
      payment_status: formData.get("payment_status") as "complete" | "partial" | "not_defined",
      total_fees: formData.get("total_fees") ? parseFloat(formData.get("total_fees") as string) : undefined,
      birthday: formData.get("birthday") as string,
    };

    // Add image URL if a new image was uploaded
    if (image_url) {
      updatedStudent.image_url = image_url;
    }

    try {
      // If ID is being changed
      if (newId && newId !== oldId) {
        // Create new student with new ID
        const newStudent = { ...existingStudent, ...updatedStudent, id: newId };
        await Database.createStudentWithId(newId, newStudent);

        // Update all related exams
        const exams = await Database.getStudentExams(oldId);
        for (const exam of exams) {
          await Database.updateExam(exam.id, { student_id: newId });
        }

        // Update all related payments
        const payments = await Database.getStudentPayments(oldId);
        for (const payment of payments) {
          await Database.updatePayment(payment.id, { student_id: newId });
        }

        // Delete old student
        await Database.deleteStudent(oldId);

        return new Response(null, {
          status: 303,
          headers: {
            Location: `/students/${newId}`,
          },
        });
      } else {
        // Regular update without ID change
        await Database.updateStudent(oldId, updatedStudent);
        return new Response(null, {
          status: 303,
          headers: {
            Location: `/students/${oldId}`,
          },
        });
      }
    } catch (error) {
      console.error("Error updating student:", error);
      return new Response(JSON.stringify({ 
        error: "Error updating student", 
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  async DELETE(req, ctx) {
    const id = ctx.params.id;
    try {
      await Database.deleteStudent(id);
      return new Response(null, {
        status: 303,
        headers: {
          Location: "/students",
        },
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      return new Response(JSON.stringify({ 
        error: "Error deleting student", 
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}; 