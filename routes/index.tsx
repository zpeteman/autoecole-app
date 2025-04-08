import { Head } from "$fresh/runtime.ts";
import Layout from "../components/Layout.tsx";
import { Database } from "../db/kv.ts";
import { Student, Exam, Payment } from "../db/types.ts";

function getItemDate(item: Student | Exam | Payment): Date {
  if ("date_of_registration" in item) {
    return new Date(item.date_of_registration);
  } else if ("exam_date" in item) {
    return new Date(item.exam_date);
  } else {
    return new Date(item.payment_date);
  }
}

export default async function Home() {
  const students = await Database.listStudents();
  const exams = await Database.listExams();
  const payments = await Database.listPayments();

  // Calculate statistics
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "active").length;
  const totalExams = exams.length;
  const passedExams = exams.filter((e) => e.result === "pass").length;
  const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  // Get recent items (last 5)
  const recentStudents = [...students]
    .sort((a, b) => new Date(b.date_of_registration).getTime() - new Date(a.date_of_registration).getTime())
    .slice(0, 5);

  const recentExams = [...exams]
    .sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime())
    .slice(0, 5);

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
    .slice(0, 5);

  // Combine all recent actions and sort by date
  const recentActions = [
    ...recentStudents.map(s => ({ type: 'student', item: s, date: new Date(s.date_of_registration) })),
    ...recentExams.map(e => ({ type: 'exam', item: e, date: new Date(e.exam_date) })),
    ...recentPayments.map(p => ({ type: 'payment', item: p, date: new Date(p.payment_date) }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <>
      <Head>
        <title>Auto École - Tableau de bord</title>
      </Head>
      <Layout>
        <div class="py-6">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div class="flex justify-between items-center">
              <h1 class="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
              <a
                href="/statistics"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Voir les statistiques
              </a>
            </div>
          </div>
          <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div class="py-4">
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Students Card */}
                <div class="overflow-hidden rounded-lg bg-white shadow">
                  <div class="p-5">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg
                          class="h-6 w-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <div class="ml-5 w-0 flex-1">
                        <dl>
                          <dt class="truncate text-sm font-medium text-gray-500">
                            Total des étudiants
                          </dt>
                          <dd class="flex items-baseline">
                            <div class="text-2xl font-semibold text-gray-900">
                              {totalStudents}
                            </div>
                            <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                              <svg
                                class="h-5 w-5 flex-shrink-0 self-center text-green-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                              <span class="sr-only">Augmentation</span>
                              {activeStudents} actifs
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div class="bg-gray-50 px-5 py-3">
                    <div class="text-sm">
                      <a
                        href="/students"
                        class="font-medium text-indigo-700 hover:text-indigo-900"
                      >
                        Voir tous les étudiants
                      </a>
                    </div>
                  </div>
                </div>

                {/* Exams Card */}
                <div class="overflow-hidden rounded-lg bg-white shadow">
                  <div class="p-5">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg
                          class="h-6 w-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <div class="ml-5 w-0 flex-1">
                        <dl>
                          <dt class="truncate text-sm font-medium text-gray-500">
                            Total des examens
                          </dt>
                          <dd class="flex items-baseline">
                            <div class="text-2xl font-semibold text-gray-900">
                              {totalExams}
                            </div>
                            <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                              <svg
                                class="h-5 w-5 flex-shrink-0 self-center text-green-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                              <span class="sr-only">Augmentation</span>
                              {passedExams} réussis
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div class="bg-gray-50 px-5 py-3">
                    <div class="text-sm">
                      <a
                        href="/exams"
                        class="font-medium text-indigo-700 hover:text-indigo-900"
                      >
                        Voir tous les examens
                      </a>
                    </div>
                  </div>
                </div>

                {/* Payments Card */}
                <div class="overflow-hidden rounded-lg bg-white shadow">
                  <div class="p-5">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg
                          class="h-6 w-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div class="ml-5 w-0 flex-1">
                        <dl>
                          <dt class="truncate text-sm font-medium text-gray-500">
                            Total des paiements
                          </dt>
                          <dd class="flex items-baseline">
                            <div class="text-2xl font-semibold text-gray-900">
                              {totalPayments.toLocaleString()} DH
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div class="bg-gray-50 px-5 py-3">
                    <div class="text-sm">
                      <a
                        href="/payments"
                        class="font-medium text-indigo-700 hover:text-indigo-900"
                      >
                        Voir tous les paiements
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Actions */}
            <div class="mt-8">
              <h2 class="text-lg font-medium text-gray-900">Actions récentes</h2>
              <div class="mt-4 overflow-hidden bg-white shadow sm:rounded-md">
                <ul class="divide-y divide-gray-200">
                  {recentActions.map((action) => (
                    <li>
                      <div class="px-4 py-4 sm:px-6">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center">
                            <div class="flex-shrink-0">
                              {action.type === 'student' && (
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              )}
                              {action.type === 'exam' && (
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              )}
                              {action.type === 'payment' && (
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </div>
                            <div class="ml-3">
                              <p class="text-sm font-medium text-gray-900">
                                {action.type === 'student' && `Nouvel étudiant: ${(action.item as Student).name}`}
                                {action.type === 'exam' && `Examen ${(action.item as Exam).exam_type === 'code' ? 'Code' : 'Conduite'}`}
                                {action.type === 'payment' && `Paiement: ${(action.item as Payment).amount} DH`}
                              </p>
                              <p class="text-sm text-gray-500">
                                {action.date.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recent Statistics */}
            <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {/* Recent Students */}
              <div class="overflow-hidden rounded-lg bg-white shadow">
                <div class="p-5">
                  <h3 class="text-lg font-medium text-gray-900">Derniers étudiants</h3>
                  <div class="mt-4">
                    <ul class="divide-y divide-gray-200">
                      {recentStudents.map((student) => (
                        <li class="py-3">
                          <div class="flex items-center space-x-4">
                            <div class="flex-shrink-0">
                              {student.image_url ? (
                                <img class="h-8 w-8 rounded-full" src={student.image_url} alt={student.name} />
                              ) : (
                                <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                  <span class="text-sm font-medium text-gray-600">{student.name.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                              <p class="text-sm text-gray-500">{student.phone}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recent Exams */}
              <div class="overflow-hidden rounded-lg bg-white shadow">
                <div class="p-5">
                  <h3 class="text-lg font-medium text-gray-900">Derniers examens</h3>
                  <div class="mt-4">
                    <ul class="divide-y divide-gray-200">
                      {recentExams.map((exam) => (
                        <li class="py-3">
                          <div class="flex items-center justify-between">
                            <div>
                              <p class="text-sm font-medium text-gray-900">
                                {exam.exam_type === 'code' ? 'Code' : 'Conduite'}
                              </p>
                              <p class="text-sm text-gray-500">
                                {new Date(exam.exam_date).toLocaleDateString()}
                              </p>
                            </div>
                            <span class={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              exam.result === "pass"
                                ? "bg-green-100 text-green-800"
                                : exam.result === "fail"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {exam.result === "pass" 
                                ? "Réussi" 
                                : exam.result === "fail" 
                                  ? "Échoué" 
                                  : "En attente"}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recent Payments */}
              <div class="overflow-hidden rounded-lg bg-white shadow">
                <div class="p-5">
                  <h3 class="text-lg font-medium text-gray-900">Derniers paiements</h3>
                  <div class="mt-4">
                    <ul class="divide-y divide-gray-200">
                      {recentPayments.map((payment) => (
                        <li class="py-3">
                          <div class="flex items-center justify-between">
                            <div>
                              <p class="text-sm font-medium text-gray-900">
                                {payment.amount} DH
                              </p>
                              <p class="text-sm text-gray-500">
                                {new Date(payment.payment_date).toLocaleDateString()}
                              </p>
                            </div>
                            <span class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                              {payment.payment_type}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
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
