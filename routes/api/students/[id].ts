import { Handlers } from "$fresh/server.ts";
import { Database } from "../../../db/kv.ts";
import { Student } from "../../../db/types.ts";

async function saveImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = new Uint8Array(bytes);
  
  // Create a unique filename
  const filename = `${crypto.randomUUID()}-${file.name}`;
  const path = `./static/uploads/${filename}`;
  
  // Ensure the uploads directory exists
  try {
    await Deno.mkdir("./static/uploads", { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }
  
  // Save the file
  await Deno.writeFile(path, buffer);
  
  // Return the public URL
  return `/uploads/${filename}`;
}

export const handler: Handlers = {
  async POST(req, ctx) {
    const id = ctx.params.id;
    const formData = await req.formData();
    
    // Handle image upload
    let image_url: string | undefined;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      image_url = await saveImage(imageFile);
    }

    // Get the new ID from the form
    const newId = formData.get("id") as string;
    
    // Get the existing student
    const existingStudent = await Database.getStudent(id);
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
      // If the ID is being changed, we need to handle this specially
      if (newId !== id) {
        // Create a new student with the new ID
        const newStudent: Omit<Student, "id"> = {
          ...existingStudent,
          ...updatedStudent,
        };
        
        // Delete the old student
        await Database.deleteStudent(id);
        
        // Create the new student with the new ID
        await Database.createStudentWithId(newId, newStudent);
      } else {
        // Just update the existing student
        await Database.updateStudent(id, updatedStudent);
      }
      
      return new Response(null, {
        status: 303,
        headers: {
          Location: `/students/${newId}`,
        },
      });
    } catch (error) {
      console.error("Error updating student:", error);
      return new Response("Error updating student", { status: 500 });
    }
  },
}; 