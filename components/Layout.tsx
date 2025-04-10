import { ComponentChildren } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";
import DarkModeToggle from "../islands/DarkModeToggle.tsx";
import { Head } from "$fresh/runtime.ts";
import MobileMenu from "../islands/MobileMenu.tsx";

interface LayoutProps {
  children: ComponentChildren;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>Auto-École</title>
        <link rel="stylesheet" href="/styles.css" />
        <script src="/js/export.js" defer></script>
      </Head>
      <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        {/* Navigation */}
        <nav class="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-200">
          <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between h-16">
              <div class="flex">
                <div class="flex-shrink-0 flex items-center">
                  <a href="/" class="flex items-center">
                    <img src="/favicon.png" alt="Auto École Logo" class="h-8 w-8 mr-2" />
                    <span class="text-xl font-bold text-gray-800 dark:text-white transition-colors duration-200">
                      Auto École
                    </span>
                  </a>
                </div>
                {/* Desktop Navigation */}
                <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <a
                    href="/students"
                    class="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                  >
                    Students
                  </a>
                  <a
                    href="/exams"
                    class="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                  >
                    Exams
                  </a>
                  <a
                    href="/payments"
                    class="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                  >
                    Payments
                  </a>
                  <a
                    href="/statistics"
                    class="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                  >
                    Statistics
                  </a>
                  <a
                    href="/settings"
                    class="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                  >
                    Settings
                  </a>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <DarkModeToggle />
                <form action="/logout" method="POST">
                  <button
                    type="submit"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Déconnexion
                  </button>
                </form>
              </div>
              {/* Mobile menu button */}
              <MobileMenu />
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </>
  );
} 