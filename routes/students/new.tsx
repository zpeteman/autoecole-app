import { Head } from "$fresh/runtime.ts";
import Layout from "../../components/Layout.tsx";

export default function NewStudent() {
  return (
    <>
      <Head>
        <title>Auto École - Nouvel étudiant</title>
      </Head>
      <Layout>
        <div class="py-6">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <h1 class="text-2xl font-semibold text-gray-900">Nouvel étudiant</h1>
          </div>
          <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div class="py-4">
              <div class="bg-white shadow sm:rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <form
                    method="POST"
                    action="/api/students"
                    encType="multipart/form-data"
                    class="space-y-8 divide-y divide-gray-200"
                  >
                    <div class="space-y-8 divide-y divide-gray-200">
                      <div>
                        <div>
                          <h3 class="text-lg font-medium leading-6 text-gray-900">
                            Informations de l'étudiant
                          </h3>
                          <p class="mt-1 text-sm text-gray-500">
                            Ajoutez un nouvel étudiant à l'auto-école.
                          </p>
                        </div>

                        <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div class="sm:col-span-6">
                            <label
                              for="image"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Photo
                            </label>
                            <div class="mt-1 flex items-center">
                              <div class="h-24 w-24 overflow-hidden rounded-full bg-gray-100">
                                <img
                                  id="preview"
                                  src="/placeholder-avatar.png"
                                  alt="Preview"
                                  class="h-24 w-24 object-cover"
                                />
                              </div>
                              <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                class="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                onChange={(e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      const preview = document.getElementById("preview") as HTMLImageElement;
                                      if (preview && e.target?.result) {
                                        preview.src = e.target.result as string;
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          </div>

                          <div class="sm:col-span-3">
                            <label
                              for="name"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Nom complet
                            </label>
                            <div class="mt-1">
                              <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div class="sm:col-span-3">
                            <label
                              for="birthday"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Date de naissance
                            </label>
                            <div class="mt-1">
                              <input
                                type="date"
                                name="birthday"
                                id="birthday"
                                required
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div class="sm:col-span-3">
                            <label
                              for="phone"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Numéro de téléphone
                            </label>
                            <div class="mt-1">
                              <input
                                type="tel"
                                name="phone"
                                id="phone"
                                required
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div class="sm:col-span-3">
                            <label
                              for="national_id"
                              class="block text-sm font-medium text-gray-700"
                            >
                              CIN
                            </label>
                            <div class="mt-1">
                              <input
                                type="text"
                                name="national_id"
                                id="national_id"
                                required
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div class="sm:col-span-3">
                            <label
                              for="status"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Statut
                            </label>
                            <div class="mt-1">
                              <select
                                id="status"
                                name="status"
                                required
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="active">Actif</option>
                                <option value="inactive">Inactif</option>
                              </select>
                            </div>
                          </div>

                          <div class="sm:col-span-3">
                            <label
                              for="payment_status"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Statut de paiement
                            </label>
                            <div class="mt-1">
                              <select
                                id="payment_status"
                                name="payment_status"
                                required
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="not_defined">Non défini</option>
                                <option value="partial">Partiel</option>
                                <option value="complete">Complet</option>
                              </select>
                            </div>
                          </div>

                          <div class="sm:col-span-3">
                            <label
                              for="total_fees"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Frais totaux (DH)
                            </label>
                            <div class="mt-1">
                              <input
                                type="number"
                                name="total_fees"
                                id="total_fees"
                                step="0.01"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div class="sm:col-span-3">
                            <label
                              for="student_id"
                              class="block text-sm font-medium text-gray-700"
                            >
                              ID Étudiant
                            </label>
                            <div class="mt-1">
                              <input
                                type="text"
                                name="student_id"
                                id="student_id"
                                required
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div class="sm:col-span-6">
                            <label
                              for="address"
                              class="block text-sm font-medium text-gray-700"
                            >
                              Adresse
                            </label>
                            <div class="mt-1">
                              <textarea
                                name="address"
                                id="address"
                                rows="3"
                                required
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="pt-5">
                      <div class="flex justify-end">
                        <a
                          href="/students"
                          class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Annuler
                        </a>
                        <button
                          type="submit"
                          class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Créer l'étudiant
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