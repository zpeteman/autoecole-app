import { Head } from "$fresh/runtime.ts";
import Layout from "../components/Layout.tsx";

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Auto École - Page non trouvée</title>
      </Head>
      <Layout>
        <div class="min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <h1 class="text-9xl font-extrabold text-indigo-600">404</h1>
            <h2 class="mt-4 text-3xl font-bold text-gray-900">Page non trouvée</h2>
            <p class="mt-2 text-lg text-gray-600">
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
            </p>
            <div class="mt-6">
              <a
                href="/"
                class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
} 