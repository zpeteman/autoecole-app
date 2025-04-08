import { Student, Exam, Payment } from "../db/types.ts";

/**
 * Converts an array of objects to CSV format
 * @param data Array of objects to convert
 * @param headers Optional custom headers (keys of the first object by default)
 * @returns CSV string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers?: string[]
): string {
  if (data.length === 0) return "";
  
  // Use provided headers or get keys from the first object
  const headerRow = headers || Object.keys(data[0]);
  
  // Create CSV header row
  const csvRows = [headerRow.join(",")];
  
  // Add data rows
  for (const item of data) {
    const values = headerRow.map(header => {
      const value = item[header];
      // Handle special cases
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return JSON.stringify(value);
      // Escape commas and quotes in string values
      if (typeof value === "string") {
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
      }
      return value;
    });
    csvRows.push(values.join(","));
  }
  
  return csvRows.join("\n");
}

/**
 * Exports data to a CSV file and triggers download
 * @param data Array of objects to export
 * @param filename Name of the file to download
 * @param headers Optional custom headers
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: string[]
): void {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  // Check for IE support
  if ((navigator as any).msSaveBlob) {
    // IE 10+
    (navigator as any).msSaveBlob(blob, filename);
  } else {
    // Other browsers
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Formats student data for export
 */
export function formatStudentsForExport(students: Student[]): Record<string, any>[] {
  return students.map(student => ({
    id: student.id,
    name: student.name,
    phone: student.phone,
    national_id: student.national_id,
    status: student.status === "active" ? "Actif" : "Inactif",
    payment_status: student.payment_status === "complete" ? "Complet" : 
                   student.payment_status === "partial" ? "Partiel" : "Non défini",
    date_of_registration: new Date(student.date_of_registration).toLocaleDateString(),
    birthday: student.birthday ? new Date(student.birthday).toLocaleDateString() : "Non spécifié",
    total_fees: student.total_fees || 0
  }));
}

/**
 * Formats exam data for export
 */
export function formatExamsForExport(exams: Exam[], students: Student[]): Record<string, any>[] {
  const studentMap = new Map(students.map(s => [s.id, s]));
  
  return exams.map(exam => {
    const student = studentMap.get(exam.student_id);
    return {
      id: exam.id,
      student_name: student?.name || "Inconnu",
      student_id: exam.student_id,
      exam_type: exam.exam_type === "code" ? "Code" : "Conduite",
      exam_date: new Date(exam.exam_date).toLocaleDateString(),
      result: exam.result === "pass" ? "Réussi" : 
              exam.result === "fail" ? "Échoué" : "En attente",
      notes: exam.notes || ""
    };
  });
}

/**
 * Formats payment data for export
 */
export function formatPaymentsForExport(payments: Payment[], students: Student[]): Record<string, any>[] {
  const studentMap = new Map(students.map(s => [s.id, s]));
  
  return payments.map(payment => {
    const student = studentMap.get(payment.student_id);
    return {
      id: payment.id,
      student_name: student?.name || "Inconnu",
      student_id: payment.student_id,
      amount: payment.amount,
      payment_date: new Date(payment.payment_date).toLocaleDateString(),
      payment_type: payment.payment_type,
      notes: payment.notes || ""
    };
  });
} 