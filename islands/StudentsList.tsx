import { useState, useEffect } from "preact/hooks";
import Layout from "../components/Layout.tsx";
import { Student } from "../db/types.ts";
import { formatStudentsForExport } from "../utils/export.ts";

export function StudentsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students");
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        const fetchedStudents = await response.json();
        // Sort students: active first, then by ID
        const sortedStudents = [...fetchedStudents].sort((a, b) => {
          if (a.status === "active" && b.status !== "active") return -1;
          if (a.status !== "active" && b.status === "active") return 1;
          return a.id.localeCompare(b.id);
        });
        setStudents(sortedStudents);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.national_id.toLowerCase().includes(searchLower) ||
      student.phone.toLowerCase().includes(searchLower) ||
      student.id.toLowerCase().includes(searchLower)
    );
  });

  // Format students for export
  const formattedStudents = formatStudentsForExport(filteredStudents);

  if (loading) {
    return (
      <Layout>
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Erreur</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="sm:flex sm:items-center">
          <div class="sm:flex-auto">
            <h1 class="text-xl font-semibold text-gray-900">Étudiants</h1>
            <p class="mt-2 text-sm text-gray-700">
              Liste de tous les étudiants inscrits à l'auto-école.
            </p>
          </div>
          <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              id="export-students-btn"
              data-students={JSON.stringify(formattedStudents)}
              class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exporter
            </button>
            <a
              href="/students/new"
              class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un étudiant
            </a>
          </div>
        </div>

        {/* Search Bar */}
        <div class="mt-4">
          <div class="relative rounded-md shadow-sm">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              class="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Rechercher par nom, CIN, téléphone ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
            />
          </div>
        </div>

        {/* Students Table - Desktop View */}
        <div class="mt-8 hidden md:block">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table id="students-table" class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Photo</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">CIN</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nom</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Téléphone</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                {filteredStudents.map((student) => (
                  <tr>
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div class="h-10 w-10 flex-shrink-0">
                        {student.image_url ? (
                          <img
                            class="h-10 w-10 rounded-full object-cover"
                            src={student.image_url}
                            alt={student.name}
                          />
                        ) : (
                          <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <span class="text-lg font-medium text-gray-600">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                      {student.id}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.national_id}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.name}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.phone}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span class={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        student.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {student.status === "active" ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <a href={`/students/${student.id}`} class="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                        <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Détails
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Students Cards - Mobile View */}
        <div class="mt-8 md:hidden">
          <div class="space-y-4">
            {filteredStudents.map((student) => (
              <div class="bg-white shadow rounded-lg overflow-hidden">
                <div class="p-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12">
                      {student.image_url ? (
                        <img
                          class="h-12 w-12 rounded-full object-cover"
                          src={student.image_url}
                          alt={student.name}
                        />
                      ) : (
                        <div class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <span class="text-lg font-medium text-gray-600">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div class="ml-4">
                      <h3 class="text-lg font-medium text-gray-900">{student.name}</h3>
                      <p class="text-sm text-gray-500">ID: {student.id}</p>
                    </div>
                    <div class="ml-auto">
                      <span class={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        student.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {student.status === "active" ? "Actif" : "Inactif"}
                      </span>
                    </div>
                  </div>
                  <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p class="text-gray-500">CIN</p>
                      <p class="font-medium">{student.national_id}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Téléphone</p>
                      <p class="font-medium">{student.phone}</p>
                    </div>
                  </div>
                  <div class="mt-4">
                    <a 
                      href={`/students/${student.id}`}
                      class="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Voir les détails
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No Results Message */}
        {filteredStudents.length === 0 && (
          <div class="mt-8">
            <div class="rounded-md bg-yellow-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-yellow-800">Aucun résultat trouvé</h3>
                  <div class="mt-2 text-sm text-yellow-700">
                    <p>Aucun étudiant ne correspond à votre recherche. Veuillez essayer avec d'autres termes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 