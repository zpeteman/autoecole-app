import { Head } from "$fresh/runtime.ts";
import Layout from "../../components/Layout.tsx";
import { Database } from "../../db/kv.ts";
import { Student, Exam, Payment } from "../../db/types.ts";

export default async function StudentDetail(req: Request, { params }: { params: { id: string } }) {
  const student = await Database.getStudent(params.id);
  if (!student) {
    return new Response("Student not found", { status: 404 });
  }

  const exams = await Database.listExams();
  const studentExams = exams.filter((exam) => exam.student_id === params.id);

  const payments = await Database.listPayments();
  const studentPayments = payments.filter((payment) => payment.student_id === params.id);

  // Calculate total paid amount
  const totalPaid = studentPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  const totalFees = student.total_fees || 0;

  // Calculate payment status
  let paymentStatus = student.payment_status;
  if (totalFees > 0) {
    if (totalPaid >= totalFees) {
      paymentStatus = "complete";
    } else if (totalPaid > 0) {
      paymentStatus = "partial";
    } else {
      paymentStatus = "not_defined";
    }
  }

  // Update student payment status if it has changed
  if (paymentStatus !== student.payment_status) {
    await Database.updateStudent(student.id, { payment_status: paymentStatus });
  }

  return (
    <>
      <Head>
        <title>Auto École - Détails de l'étudiant</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Wait for the DOM to be fully loaded
            document.addEventListener('DOMContentLoaded', function() {
              // Initialize jsPDF
              window.jspdf = window.jspdf || {};
              window.jspdf.jsPDF = window.jspdf.jsPDF || window.jspdf;
              
              // Add click handler for export button
              const exportButton = document.querySelector('[data-action="export-pdf"]');
              if (exportButton) {
                exportButton.addEventListener('click', function(e) {
                  e.preventDefault();
                  exportStudentPDF();
                });
              }
            });

            function exportStudentPDF() {
              try {
                // @ts-ignore - jspdf is loaded from CDN
                const { jsPDF } = window.jspdf;
                
                // Create a new PDF document
                const doc = new jsPDF();
                
                // Get student data
                const studentDataElement = document.getElementById('student-data');
                const examsDataElement = document.getElementById('exams-data');
                const paymentsDataElement = document.getElementById('payments-data');
                
                if (!studentDataElement?.dataset?.student || !examsDataElement?.dataset?.exams || !paymentsDataElement?.dataset?.payments) {
                  console.error('Required data elements not found');
                  return;
                }

                const studentData = JSON.parse(studentDataElement.dataset.student);
                const examsData = JSON.parse(examsDataElement.dataset.exams);
                const paymentsData = JSON.parse(paymentsDataElement.dataset.payments);
                
                // Add title with styling
                doc.setFillColor(66, 139, 202);
                doc.rect(0, 0, 210, 30, 'F');
                
                // Add logo
                try {
                  doc.addImage('/favicon.png', 'PNG', 20, 5, 20, 20);
                } catch (err) {
                  console.error('Error adding logo:', err);
                }
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(24);
                doc.text("Fiche d'étudiant", 105, 20, { align: "center" });
                
                // Reset text color
                doc.setTextColor(0, 0, 0);
                
                let currentY = 40;
                
                // Add student information in a more compact layout
                doc.setFontSize(12);
                const info = [
                  ["ID Étudiant:", studentData.student_id || "Non défini"],
                  ["Nom:", studentData.name],
                  ["Téléphone:", studentData.phone],
                  ["CIN:", studentData.national_id],
                  ["Adresse:", studentData.address || "Non spécifiée"],
                  ["Statut:", studentData.status === "active" ? "Actif" : "Inactif"],
                  ["Statut de paiement:", studentData.payment_status === "complete" ? "Complet" : 
                    studentData.payment_status === "partial" ? "Partiel" : "Non défini"],
                  ["Date d'inscription:", new Date(studentData.date_of_registration).toLocaleDateString()],
                  ["Date de naissance:", studentData.birthday ? new Date(studentData.birthday).toLocaleDateString() : "Non spécifiée"],
                  ["Frais totaux:", (studentData.total_fees || 0) + " DH"]
                ];
                
                // Create a table for student information
                doc.autoTable({
                  startY: currentY,
                  head: [["Information", "Valeur"]],
                  body: info,
                  theme: 'grid',
                  headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
                  styles: { fontSize: 10 },
                  columnStyles: { 0: { fontStyle: 'bold' } }
                });
                
                // Add exams information
                const examY = doc.lastAutoTable.finalY + 10;
                doc.setFontSize(14);
                doc.setTextColor(66, 139, 202);
                doc.text("Historique des examens", 20, examY);
                
                if (examsData.length > 0) {
                  const examHeaders = [["Type", "Date", "Résultat", "Notes"]];
                  const examRows = examsData.map(exam => [
                    exam.exam_type === "code" ? "Code" : "Conduite",
                    new Date(exam.exam_date).toLocaleDateString(),
                    exam.result === "pass" ? "Réussi" : 
                    exam.result === "fail" ? "Échoué" : "En attente",
                    exam.notes || ""
                  ]);
                  
                  doc.autoTable({
                    startY: examY + 5,
                    head: examHeaders,
                    body: examRows,
                    theme: 'grid',
                    headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
                    styles: { fontSize: 10 }
                  });
                } else {
                  doc.setFontSize(10);
                  doc.setTextColor(0, 0, 0);
                  doc.text("Aucun examen enregistré", 20, examY + 10);
                }
                
                // Add payments information
                const paymentY = doc.lastAutoTable.finalY + 10;
                doc.setFontSize(14);
                doc.setTextColor(66, 139, 202);
                doc.text("Historique des paiements", 20, paymentY);
                
                if (paymentsData.length > 0) {
                  const paymentHeaders = [["Date", "Montant", "Type", "Notes"]];
                  const paymentRows = paymentsData.map(payment => [
                    new Date(payment.payment_date).toLocaleDateString(),
                    payment.amount + " DH",
                    payment.payment_type === "cash" ? "Espèces" : "Carte",
                    payment.notes || ""
                  ]);
                  
                  doc.autoTable({
                    startY: paymentY + 5,
                    head: paymentHeaders,
                    body: paymentRows,
                    theme: 'grid',
                    headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
                    styles: { fontSize: 10 }
                  });
                  
                  // Calculate total payments
                  const totalPayments = paymentsData.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                  const totalFees = studentData.total_fees || 0;
                  const remainingFees = totalFees - totalPayments;
                  
                  doc.setFontSize(10);
                  doc.setTextColor(0, 0, 0);
                  doc.text("Total des paiements: " + totalPayments.toFixed(2) + " DH", 20, doc.lastAutoTable.finalY + 10);
                  doc.text("Frais totaux: " + totalFees.toFixed(2) + " DH", 20, doc.lastAutoTable.finalY + 15);
                  doc.text("Reste à payer: " + remainingFees.toFixed(2) + " DH", 20, doc.lastAutoTable.finalY + 20);
                } else {
                  doc.setFontSize(10);
                  doc.setTextColor(0, 0, 0);
                  doc.text("Aucun paiement enregistré", 20, paymentY + 10);
                  doc.text("Frais totaux: " + (studentData.total_fees || 0) + " DH", 20, paymentY + 15);
                  doc.text("Reste à payer: " + (studentData.total_fees || 0) + " DH", 20, paymentY + 20);
                }
                
                // Add footer with page numbers
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                  doc.setPage(i);
                  doc.setFontSize(8);
                  doc.setTextColor(128, 128, 128);
                  doc.text(
                    'Page ' + i + ' sur ' + pageCount,
                    doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                  );
                }
                
                // Save the PDF
                doc.save(studentData.name.replace(/\s+/g, '_') + "_fiche.pdf");
              } catch (error) {
                console.error('Error generating PDF:', error);
                alert('Une erreur est survenue lors de la génération du PDF');
              }
            }
          `
        }} />
      </Head>
      <Layout>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hidden data elements for PDF export */}
          <div id="student-data" data-student={JSON.stringify(student)} class="hidden"></div>
          <div id="exams-data" data-exams={JSON.stringify(studentExams)} class="hidden"></div>
          <div id="payments-data" data-payments={JSON.stringify(studentPayments)} class="hidden"></div>

          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="p-6">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div class="flex items-center gap-4">
                  <div class="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {student.image_url ? (
                      <img 
                        src={`/api/students?image=${student.image_url}`}
                        alt={student.name} 
                        class="w-full h-full object-cover"
                      />
                    ) : (
                      <div class="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 class="text-2xl font-bold text-gray-900">{student.name}</h1>
                    <p class="text-sm text-gray-500">ID Étudiant: {student.student_id || "Non défini"}</p>
                  </div>
                </div>
                <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <a
                    href={`/students/${student.id}/edit`}
                    class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Modifier
                  </a>
                  <button
                    data-action="export-pdf"
                    class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    Exporter PDF
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div>
                    <h2 class="text-lg font-medium text-gray-900">Informations personnelles</h2>
                    <dl class="mt-2 grid grid-cols-1 gap-2">
                      <div class="flex flex-col sm:flex-row sm:items-center py-2 border-b">
                        <dt class="text-sm font-medium text-gray-500 sm:w-1/3">CIN</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{student.national_id}</dd>
                      </div>
                      <div class="flex flex-col sm:flex-row sm:items-center py-2 border-b">
                        <dt class="text-sm font-medium text-gray-500 sm:w-1/3">Téléphone</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{student.phone}</dd>
                      </div>
                      <div class="flex flex-col sm:flex-row sm:items-center py-2 border-b">
                        <dt class="text-sm font-medium text-gray-500 sm:w-1/3">Adresse</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{student.address}</dd>
                      </div>
                      <div class="flex flex-col sm:flex-row sm:items-center py-2 border-b">
                        <dt class="text-sm font-medium text-gray-500 sm:w-1/3">Date d'inscription</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">
                          {new Date(student.date_of_registration).toLocaleDateString()}
                        </dd>
                      </div>
                      {student.birthday && (
                        <div class="flex flex-col sm:flex-row sm:items-center py-2 border-b">
                          <dt class="text-sm font-medium text-gray-500 sm:w-1/3">Date de naissance</dt>
                          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">
                            {new Date(student.birthday).toLocaleDateString()}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                <div class="space-y-4">
                  <div>
                    <h2 class="text-lg font-medium text-gray-900">Statut et paiements</h2>
                    <dl class="mt-2 grid grid-cols-1 gap-2">
                      <div class="flex flex-col sm:flex-row sm:items-center py-2 border-b">
                        <dt class="text-sm font-medium text-gray-500 sm:w-1/3">Statut</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">
                          <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {student.status === "active" ? "Actif" : "Inactif"}
                          </span>
                        </dd>
                      </div>
                      <div class="flex flex-col sm:flex-row sm:items-center py-2 border-b">
                        <dt class="text-sm font-medium text-gray-500 sm:w-1/3">Statut de paiement</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">
                          <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.payment_status === "complete" ? "bg-green-100 text-green-800" :
                            student.payment_status === "partial" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {student.payment_status === "complete" ? "Complet" :
                             student.payment_status === "partial" ? "Partiel" : "Non défini"}
                          </span>
                        </dd>
                      </div>
                      <div class="flex flex-col sm:flex-row sm:items-center py-2 border-b">
                        <dt class="text-sm font-medium text-gray-500 sm:w-1/3">Frais totaux</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{totalFees} DH</dd>
                      </div>
                      <div class="flex flex-col sm:flex-row sm:items-center py-2 border-b">
                        <dt class="text-sm font-medium text-gray-500 sm:w-1/3">Total payé</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{totalPaid} DH</dd>
                      </div>
                      <div class="flex flex-col sm:flex-row sm:items-center py-2 border-b">
                        <dt class="text-sm font-medium text-gray-500 sm:w-1/3">Reste à payer</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{totalFees - totalPaid} DH</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              <div class="mt-8">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-lg font-medium text-gray-900">Historique des examens</h2>
                  <a
                    href={`/exams/new?student=${student.id}`}
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                    Ajouter un examen
                  </a>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Résultat</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      {studentExams.map((exam) => (
                        <tr key={exam.id}>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {exam.exam_type === "code" ? "Code" : "Conduite"}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(exam.exam_date).toLocaleDateString()}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              exam.result === "pass" ? "bg-green-100 text-green-800" :
                              exam.result === "fail" ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {exam.result === "pass" ? "Réussi" :
                               exam.result === "fail" ? "Échoué" : "En attente"}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="mt-8">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-lg font-medium text-gray-900">Historique des paiements</h2>
                  <a
                    href={`/payments/new?student=${student.id}`}
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                    Ajouter un paiement
                  </a>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      {studentPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.amount} DH</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.payment_type === "cash" ? "Espèces" : "Carte"}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
} 