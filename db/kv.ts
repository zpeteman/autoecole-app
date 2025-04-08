/// <reference lib="deno.unstable" />
import { Student, Exam, Payment } from "./types.ts";

// Initialize Deno KV
const kv = await Deno.openKv();

export class Database {
  // Student operations
  static async createStudent(student: Omit<Student, "id">): Promise<Student> {
    const id = crypto.randomUUID();
    const newStudent: Student = { ...student, id };
    await kv.set(["students", id], newStudent);
    return newStudent;
  }

  static async createStudentWithId(id: string, student: Omit<Student, "id">): Promise<Student> {
    const newStudent: Student = { ...student, id };
    await kv.set(["students", id], newStudent);
    return newStudent;
  }

  static async getStudent(id: string): Promise<Student | null> {
    const result = await kv.get(["students", id]);
    return result.value as Student || null;
  }

  static async listStudents(): Promise<Student[]> {
    const students: Student[] = [];
    for await (const entry of kv.list({ prefix: ["students"] })) {
      students.push(entry.value as Student);
    }
    return students;
  }

  static async updateStudent(id: string, student: Partial<Student>): Promise<void> {
    const existing = await this.getStudent(id);
    if (existing) {
      await kv.set(["students", id], { ...existing, ...student });
    }
  }

  static async deleteStudent(id: string): Promise<void> {
    await kv.delete(["students", id]);
  }

  // Exam operations
  static async createExam(exam: Omit<Exam, "id">): Promise<Exam> {
    const id = crypto.randomUUID();
    const newExam: Exam = { ...exam, id };
    await kv.set(["exams", id], newExam);
    return newExam;
  }

  static async getExam(id: string): Promise<Exam | null> {
    const result = await kv.get(["exams", id]);
    return result.value as Exam || null;
  }

  static async listExams(): Promise<Exam[]> {
    const exams: Exam[] = [];
    for await (const entry of kv.list({ prefix: ["exams"] })) {
      exams.push(entry.value as Exam);
    }
    return exams;
  }

  static async updateExam(id: string, exam: Partial<Exam>): Promise<void> {
    const existing = await this.getExam(id);
    if (existing) {
      await kv.set(["exams", id], { ...existing, ...exam });
    }
  }

  static async deleteExam(id: string): Promise<void> {
    await kv.delete(["exams", id]);
  }

  static async getStudentExams(studentId: string): Promise<Exam[]> {
    const exams: Exam[] = [];
    for await (const entry of kv.list({ prefix: ["exams"] })) {
      const exam = entry.value as Exam;
      if (exam.student_id === studentId) {
        exams.push(exam);
      }
    }
    return exams;
  }

  // Payment operations
  static async createPayment(payment: Omit<Payment, "id">): Promise<Payment> {
    const id = crypto.randomUUID();
    const newPayment: Payment = { ...payment, id };
    await kv.set(["payments", id], newPayment);
    return newPayment;
  }

  static async getPayment(id: string): Promise<Payment | null> {
    const result = await kv.get(["payments", id]);
    return result.value as Payment || null;
  }

  static async listPayments(): Promise<Payment[]> {
    const payments: Payment[] = [];
    for await (const entry of kv.list({ prefix: ["payments"] })) {
      payments.push(entry.value as Payment);
    }
    return payments;
  }

  static async updatePayment(id: string, payment: Partial<Payment>): Promise<void> {
    const existingPayment = await this.getPayment(id);
    if (!existingPayment) {
      throw new Error("Payment not found");
    }

    const updatedPayment = {
      ...existingPayment,
      ...payment,
    };

    await kv.set(["payments", id], updatedPayment);
  }

  static async deletePayment(id: string): Promise<void> {
    await kv.delete(["payments", id]);
  }

  static async getStudentPayments(studentId: string): Promise<Payment[]> {
    const payments: Payment[] = [];
    for await (const entry of kv.list({ prefix: ["payments"] })) {
      const payment = entry.value as Payment;
      if (payment.student_id === studentId) {
        payments.push(payment);
      }
    }
    return payments;
  }
} 