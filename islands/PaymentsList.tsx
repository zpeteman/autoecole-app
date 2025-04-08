import { useState, useEffect } from "preact/hooks";
import { Head } from "$fresh/runtime.ts";
import Layout from "../components/Layout.tsx";
import { formatPaymentsForExport } from "../utils/export.ts";
import { Payment as DBPayment, Student as DBStudent } from "../db/types.ts";

type Payment = DBPayment;
type Student = DBStudent;

export default function PaymentsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/payments/");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setPayments(data.payments);
        setStudents(data.students);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Group payments by student
  const paymentsByStudent = payments.reduce((acc, payment) => {
    const studentId = payment.student_id;
    if (!acc[studentId]) {
      acc[studentId] = [];
    }
    acc[studentId].push(payment);
    return acc;
  }, {} as Record<string, Payment[]>);

  // Format payments for export
  const formattedPayments = formatPaymentsForExport(payments, students);

  // Filter payments based on search term
  const filteredPayments = Object.entries(paymentsByStudent).filter(([studentId]) => {
    const student = students.find((s) => s.id === studentId);
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle export
  const handleExport = () => {
    const csvContent = convertToCSV(formattedPayments);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'paiements.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert data to CSV
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return "";
    
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV header row
    const csvRows = [headers.join(",")];
    
    // Add data rows
    for (const item of data) {
      const values = headers.map(header => {
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
  };

  // Handle delete
  const handleDelete = async (paymentId: string, e: Event) => {
    e.preventDefault();
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/payments/${paymentId}/delete`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert('Erreur lors de la suppression du paiement');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Erreur lors de la suppression du paiement');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div class="container mx-auto px-4 py-8">
          <p>Chargement...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div class="container mx-auto px-4 py-8">
          <p class="text-red-600">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Auto École - Paiements</title>
      </Head>
      <Layout>
        <div class="container mx-auto px-4 py-8">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 class="text-2xl font-bold">Paiements</h1>
            <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div class="relative flex-grow sm:flex-grow-0">
                <input
                  type="text"
                  placeholder="Rechercher un étudiant..."
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
                />
              </div>
              <div class="flex gap-2">
                <button
                  class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  onClick={handleExport}
                >
                  <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Exporter
                </button>
                <a
                  href="/payments/new"
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Nouveau paiement
                </a>
              </div>
            </div>
          </div>

          <div class="grid gap-6">
            {filteredPayments.map(([studentId, studentPayments]) => {
              const student = students.find((s) => s.id === studentId);
              if (!student) return null;

              const totalAmount = studentPayments.reduce((sum: number, payment: Payment) => sum + parseFloat(payment.amount), 0);

              return (
                <div key={studentId} class="bg-white rounded-lg shadow-md overflow-hidden">
                  <div class="p-4 border-b">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {student.image_url ? (
                            <img 
                              src={student.image_url} 
                              alt={student.name} 
                              class="w-full h-full object-cover"
                            />
                          ) : (
                            <div class="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <h2 class="text-xl font-semibold">
                          {student.name}
                        </h2>
                      </div>
                      <span class="text-lg font-medium text-green-600">
                        Total: {totalAmount.toFixed(2)} DH
                      </span>
                    </div>
                  </div>
                  <div class="divide-y">
                    {studentPayments.map((payment: Payment) => (
                      <div key={payment.id} class="p-4">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <p class="font-medium">{parseFloat(payment.amount).toFixed(2)} DH</p>
                            <p class="text-sm text-gray-600">
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <button
                              class="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
                              onClick={(e) => handleDelete(payment.id, e)}
                              aria-label="Supprimer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Layout>
    </>
  );
} 