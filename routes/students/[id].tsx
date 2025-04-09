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
            function exportStudentPDF() {
              // @ts-ignore - jspdf is loaded from CDN
              const { jsPDF } = window.jspdf;
              
              // Create a new PDF document
              // @ts-ignore - jspdf is loaded from CDN
              const doc = new jsPDF();
              
              // Get student data
              const studentDataElement = document.getElementById('student-data');
              const examsDataElement = document.getElementById('exams-data');
              const paymentsDataElement = document.getElementById('payments-data');
              
              if (!studentDataElement?.dataset?.student || !examsDataElement?.dataset?.exams || !paymentsDataElement?.dataset?.payments) {
                console.error('Required data elements not found');
                return;
              }

              interface StudentData {
                name: string;
                phone: string;
                national_id: string;
                status: string;
                payment_status: string;
                date_of_registration: string;
                birthday?: string;
                total_fees?: number;
                image_url?: string;
              }

              const studentData = JSON.parse(studentDataElement.dataset.student) as StudentData;
              const examsData = JSON.parse(examsDataElement.dataset.exams);
              const paymentsData = JSON.parse(paymentsDataElement.dataset.payments);
              
              // Add title with styling
              // @ts-ignore - jspdf methods
              doc.setFillColor(66, 139, 202);
              // @ts-ignore - jspdf methods
              doc.rect(0, 0, 210, 30, 'F');
              
              // Add logo
              try {
                // @ts-ignore - jspdf methods
                doc.addImage('/favicon.png', 'PNG', 20, 5, 20, 20);
              } catch (err: unknown) {
                console.error('Error adding logo:', err);
              }
              
              // @ts-ignore - jspdf methods
              doc.setTextColor(255, 255, 255);
              // @ts-ignore - jspdf methods
              doc.setFontSize(24);
              // @ts-ignore - jspdf methods
              doc.text("Fiche d'étudiant", 105, 20, { align: "center" });
              
              // Reset text color
              // @ts-ignore - jspdf methods
              doc.setTextColor(0, 0, 0);
              
              // Add student image if exists
              let currentY: number = 40;
              if (studentData.image_url) {
                try {
                  const imageUrl = \`/api/students?image=\${studentData.image_url}\`;
                  // @ts-ignore - jspdf methods
                  doc.addImage(imageUrl, 'JPEG', 20, currentY, 30, 30);
                  currentY += 35;
                } catch (err: unknown) {
                  console.error('Error adding image:', err);
                }
              }
              
              // Add student information in a more compact layout
              // @ts-ignore - jspdf methods
              doc.setFontSize(12);
              const info = [
                ["Nom:", studentData.name],
                ["Téléphone:", studentData.phone],
                ["CIN:", studentData.national_id],
                ["Statut:", studentData.status === "active" ? "Actif" : "Inactif"],
                ["Statut de paiement:", studentData.payment_status === "complete" ? "Complet" : 
                  studentData.payment_status === "partial" ? "Partiel" : "Non défini"],
                ["Date d'inscription:", new Date(studentData.date_of_registration).toLocaleDateString()],
                ["Date de naissance:", studentData.birthday ? new Date(studentData.birthday).toLocaleDateString() : "Non spécifiée"],
                ["Frais totaux:", (studentData.total_fees || 0) + " DH"]
              ];
              
              // Create a table for student information
              // @ts-ignore - jspdf-autotable methods
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
            }

            // Add click handler for export button when the DOM is loaded
            document.addEventListener('DOMContentLoaded', function() {
              const exportButton = document.querySelector('[data-action="export-pdf"]');
              if (exportButton) {
                exportButton.addEventListener('click', function(e) {
                  e.preventDefault();
                  exportStudentPDF();
                });
              }
            });
          `
        }} />
      </Head>
      <Layout>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Student Header */}
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 flex items-center space-x-4">
              <div class="flex-shrink-0">
                {student.image_url ? (
                  <img
                    class="h-24 w-24 rounded-full object-cover"
                    src={`/api/students?image=${student.image_url}`}
                    alt={student.name}
                  />
                ) : (
                  <div class="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                    <span class="text-3xl font-medium text-gray-600">
                      {student.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div class="flex-1">
                <h3 class="text-lg leading-6 font-medium text-gray-900">{student.name}</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                  ID: {student.id} | CIN: {student.national_id}
                </p>
                <div class="mt-2 flex items-center space-x-4">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {student.status === "active" ? "Actif" : "Inactif"}
                  </span>
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    paymentStatus === "complete" ? "bg-green-100 text-green-800" :
                    paymentStatus === "partial" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {paymentStatus === "complete" ? "Paiement complet" :
                     paymentStatus === "partial" ? "Paiement partiel" :
                     "Paiement non défini"}
                  </span>
                </div>
              </div>
              <div class="flex-shrink-0 space-x-2">
                <button
                  data-action="export-pdf"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exporter PDF
                </button>
                <a
                  href={`/students/${student.id}/edit`}
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Modifier
                </a>
              </div>
            </div>
            <div class="border-t border-gray-200">
              <dl>
                <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      Informations de l'étudiant
                    </h3>
                    <p class="mt-1 max-w-2xl text-sm text-gray-500">
                      Détails personnels et informations de contact.
                    </p>
                  </div>
                  <div class="border-t border-gray-200">
                    <dl class="divide-y divide-gray-200">
                      <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Nom complet</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.name}</dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Date de naissance</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {student.birthday ? new Date(student.birthday).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : "Non spécifiée"}
                        </dd>
                      </div>
                      <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">CIN</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.national_id}</dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Téléphone</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.phone}</dd>
                      </div>
                      <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Date d'inscription</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {new Date(student.date_of_registration).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Statut</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <span class={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            student.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {student.status === "active" ? "Actif" : "Inactif"}
                          </span>
                        </dd>
                      </div>
                      <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Frais totaux</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{totalFees} DH</dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Montant payé</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{totalPaid} DH</dd>
                      </div>
                      <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Reste à payer</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{Math.max(0, totalFees - totalPaid)} DH</dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Statut du paiement</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <span class={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            student.payment_status === "complete" ? "bg-green-100 text-green-800" :
                            student.payment_status === "partial" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {student.payment_status === "complete" ? "Complet" :
                             student.payment_status === "partial" ? "Partiel" : "Non défini"}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </dl>
            </div>
          </div>

          {/* Hidden data for JavaScript */}
          <div id="student-data" data-student={JSON.stringify(student)} class="hidden"></div>
          <div id="exams-data" data-exams={JSON.stringify(studentExams)} class="hidden"></div>
          <div id="payments-data" data-payments={JSON.stringify(studentPayments)} class="hidden"></div>

          {/* Exams Section */}
          <div class="mt-8">
            <div class="sm:flex sm:items-center">
              <div class="sm:flex-auto">
                <h3 class="text-lg font-medium text-gray-900">Examens</h3>
                <p class="mt-2 text-sm text-gray-700">
                  Liste de tous les examens de l'étudiant.
                </p>
              </div>
              <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <a
                  href={`/exams/new?student_id=${student.id}`}
                  class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter un examen
                </a>
              </div>
            </div>
            <div class="mt-4 flex flex-col">
              <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-300">
                      <thead class="bg-gray-50">
                        <tr>
                          <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Type
                          </th>
                          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Date
                          </th>
                          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Résultat
                          </th>
                          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Notes
                          </th>
                          <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span class="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 bg-white">
                        {studentExams.map((exam) => (
                          <tr key={exam.id}>
                            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {exam.exam_type === "code" ? "Code" : "Conduite"}
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {new Date(exam.exam_date).toLocaleDateString()}
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span class={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                exam.result === "pass" ? "bg-green-100 text-green-800" :
                                exam.result === "fail" ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                              }`}>
                                {exam.result === "pass" ? "Réussi" :
                                 exam.result === "fail" ? "Échoué" :
                                 "En attente"}
                              </span>
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {exam.notes || "-"}
                            </td>
                            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <a
                                href={`/exams/${exam.id}/edit`}
                                class="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                              >
                                <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Modifier
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Section */}
          <div class="mt-8">
            <div class="sm:flex sm:items-center">
              <div class="sm:flex-auto">
                <h3 class="text-lg font-medium text-gray-900">Paiements</h3>
                <p class="mt-2 text-sm text-gray-700">
                  Liste de tous les paiements de l'étudiant.
                </p>
              </div>
              <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <a
                  href={`/payments/new?student_id=${student.id}`}
                  class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter un paiement
                </a>
              </div>
            </div>
            <div class="mt-4 flex flex-col">
              <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-300">
                      <thead class="bg-gray-50">
                        <tr>
                          <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Date
                          </th>
                          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Montant
                          </th>
                          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Type
                          </th>
                          <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span class="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 bg-white">
                        {studentPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {payment.amount} DH
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {payment.payment_type === "cash" ? "Espèces" : "Carte"}
                            </td>
                            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <a
                                href={`/payments/${payment.id}/edit`}
                                class="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                              >
                                <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Modifier
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
} 