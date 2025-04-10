import { useState } from "preact/hooks";
import { Student } from "../db/types.ts";

interface StudentFormProps {
  student?: Partial<Student>;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}

export default function StudentForm({ student, onSubmit, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState<Partial<Student>>(student || {
    name: "",
    phone: "",
    national_id: "",
    student_id: "",
    address: "",
    payment_status: "not_defined",
    total_fees: 0,
    image_url: "",
    status: "active",
    date_of_registration: new Date().toISOString().split('T')[0],
  });
  const [cinPhoto, setCinPhoto] = useState<File | null>(null);
  const [licensePhoto, setLicensePhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });

      if (cinPhoto) {
        data.append("cin_photo", cinPhoto);
      }
      if (licensePhoto) {
        data.append("license_photo", licensePhoto);
      }

      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      {error && (
        <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Nom complet
          </label>
          <input
            type="text"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: (e.target as HTMLInputElement).value })}
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            ID Étudiant
          </label>
          <input
            type="text"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.student_id}
            onChange={(e) => setFormData({ ...formData, student_id: (e.target as HTMLInputElement).value })}
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            CIN
          </label>
          <input
            type="text"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.national_id}
            onChange={(e) => setFormData({ ...formData, national_id: (e.target as HTMLInputElement).value })}
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Téléphone
          </label>
          <input
            type="tel"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: (e.target as HTMLInputElement).value })}
          />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Adresse
          </label>
          <textarea
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: (e.target as HTMLTextAreaElement).value })}
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Photo CIN
          </label>
          <input
            type="file"
            accept="image/*"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setCinPhoto((e.target as HTMLInputElement).files?.[0] || null)}
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Photo Permis
          </label>
          <input
            type="file"
            accept="image/*"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setLicensePhoto((e.target as HTMLInputElement).files?.[0] || null)}
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Statut de paiement
          </label>
          <select
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.payment_status}
            onChange={(e) => setFormData({ ...formData, payment_status: (e.target as HTMLSelectElement).value as Student['payment_status'] })}
          >
            <option value="not_defined">En attente</option>
            <option value="partial">Partiel</option>
            <option value="complete">Complété</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Frais totaux (DH)
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.total_fees}
            onChange={(e) => setFormData({ ...formData, total_fees: parseFloat((e.target as HTMLInputElement).value) })}
          />
        </div>
      </div>

      <div class="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {student ? "Mettre à jour" : "Ajouter"}
        </button>
      </div>
    </form>
  );
} 