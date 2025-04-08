import { Head } from "$fresh/runtime.ts";
import Layout from "../../components/Layout.tsx";
import { Database } from "../../db/kv.ts";
import { Student } from "../../db/types.ts";

export default async function NewPayment() {
  const students = await Database.listStudents();

  return (
    <>
      <Head>
        <title>Auto École - Nouveau paiement</title>
      </Head>
      <Layout>
        <div class="py-6">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <h1 class="text-2xl font-semibold text-gray-900">Nouveau paiement</h1>
          </div>
          <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div class="py-4">
              <div class="bg-white shadow sm:rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <form
                    method="POST"
                    action="/api/payments"
                    class="space-y-8 divide-y divide-gray-200"
                  >
                    <div class="space-y-8 divide-y divide-gray-200">
                      <div>
                        <div>
                          <h3 class="text-lg font-medium leading-6 text-gray-900">
                            Informations du paiement
                          </h3>
                          <p class="mt-1 text-sm text-gray-500">
                            Ajoutez un nouveau paiement pour un étudiant.
                          </p>
                        </div>

                        <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div class="sm:col-span-6">
                            <label
                              for="student_id"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Étudiant
                            </label>
                            <div class="mt-1">
                              <select
                                id="student_id"
                                name="student_id"
                                required
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="">Sélectionnez un étudiant</option>
                                {students.map((student: Student) => (
                                  <option value={student.id}>
                                    {student.name} ({student.national_id})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div class="sm:col-span-3">
                            <label
                              for="amount"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Montant (DH)
                            </label>
                            <div class="mt-1">
                              <input
                                type="number"
                                name="amount"
                                id="amount"
                                step="0.01"
                                required
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div class="sm:col-span-3">
                            <label
                              for="payment_date"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Date du paiement
                            </label>
                            <div class="mt-1">
                              <input
                                type="date"
                                name="payment_date"
                                id="payment_date"
                                required
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div class="sm:col-span-3">
                            <label
                              for="payment_type"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Mode de paiement
                            </label>
                            <div class="mt-1">
                              <select
                                id="payment_type"
                                name="payment_type"
                                required
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="cash">Espèces</option>
                                <option value="card">Carte</option>
                              </select>
                            </div>
                          </div>

                          <div class="sm:col-span-6">
                            <label
                              for="notes"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Notes
                            </label>
                            <div class="mt-1">
                              <textarea
                                id="notes"
                                name="notes"
                                rows={3}
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="pt-5">
                      <div class="flex justify-end">
                        <a
                          href="/payments"
                          class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Annuler
                        </a>
                        <button
                          type="submit"
                          class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Créer le paiement
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
} 