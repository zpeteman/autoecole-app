import { Head } from "$fresh/runtime.ts";
import Layout from "../../../components/Layout.tsx";
import { Database } from "../../../db/kv.ts";
import { Exam } from "../../../db/types.ts";

export default async function EditExam(req: Request, ctx: { params: { id: string } }) {
  const exam = await Database.getExam(ctx.params.id);
  
  if (!exam) {
    return new Response("Exam not found", { status: 404 });
  }

  return (
    <>
      <Head>
        <title>Auto École - Modifier l'examen</title>
      </Head>
      <Layout>
        <div class="py-6">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <h1 class="text-2xl font-semibold text-gray-900">Modifier l'examen</h1>
          </div>
          <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div class="py-4">
              <div class="bg-white shadow sm:rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <form
                    method="POST"
                    action={`/api/exams/${exam.id}`}
                    class="space-y-8 divide-y divide-gray-200"
                  >
                    <div class="space-y-8 divide-y divide-gray-200">
                      <div>
                        <div>
                          <h3 class="text-lg font-medium leading-6 text-gray-900">
                            Informations de l'examen
                          </h3>
                          <p class="mt-1 text-sm text-gray-500">
                            Modifiez les informations de l'examen.
                          </p>
                        </div>

                        <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div class="sm:col-span-3">
                            <label
                              for="exam_type"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Type d'examen
                            </label>
                            <div class="mt-1">
                              <select
                                id="exam_type"
                                name="exam_type"
                                value={exam.exam_type}
                                required
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="code">Code</option>
                                <option value="driving">Conduite</option>
                              </select>
                            </div>
                          </div>

                          <div class="sm:col-span-3">
                            <label
                              for="exam_date"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Date de l'examen
                            </label>
                            <div class="mt-1">
                              <input
                                type="date"
                                name="exam_date"
                                id="exam_date"
                                value={exam.exam_date.split("T")[0]}
                                required
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div class="sm:col-span-3">
                            <label
                              for="result"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Résultat
                            </label>
                            <div class="mt-1">
                              <select
                                id="result"
                                name="result"
                                value={exam.result}
                                required
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="pass">Réussi</option>
                                <option value="fail">Échoué</option>
                                <option value="pending">En attente</option>
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
                              >
                                {exam.notes}
                              </textarea>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="pt-5">
                      <div class="flex justify-end">
                        <a
                          href="/exams"
                          class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Annuler
                        </a>
                        <button
                          type="submit"
                          class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Mettre à jour
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