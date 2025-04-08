import { Head } from "$fresh/runtime.ts";
import Layout from "../components/Layout.tsx";
import PasswordChangeForm from "../islands/PasswordChangeForm.tsx";

export default function Settings() {
  return (
    <>
      <Head>
        <title>Auto École - Paramètres</title>
      </Head>
      <Layout>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Paramètres
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                Gérez les paramètres de votre compte.
              </p>
            </div>
            <div class="border-t border-gray-200">
              <div class="px-4 py-5 sm:p-6">
                <h4 class="text-lg font-medium text-gray-900 mb-4">Changer le mot de passe</h4>
                <PasswordChangeForm />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
} 