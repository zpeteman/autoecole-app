import { useState, useEffect } from "preact/hooks";
import { Student, Exam, Payment } from "../db/types.ts";
import { formatStudentsForExport, formatExamsForExport, formatPaymentsForExport } from "../utils/export.ts";

interface StatisticsListProps {
  students: Student[];
  exams: Exam[];
  payments: Payment[];
}

export default function StatisticsList({ students: initialStudents, exams: initialExams, payments: initialPayments }: StatisticsListProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [students, setStudents] = useState(initialStudents);
  const [exams, setExams] = useState(initialExams);
  const [payments, setPayments] = useState(initialPayments);
  const [filteredStats, setFilteredStats] = useState({
    students: { total: 0, active: 0 },
    exams: { total: 0, passed: 0 },
    payments: { total: 0, cash: 0, card: 0 },
    successRates: { overall: 0, code: 0, driving: 0 }
  });

  // Format data for export
  const formattedStudents = formatStudentsForExport(students);
  const formattedExams = formatExamsForExport(exams, students);
  const formattedPayments = formatPaymentsForExport(payments, students);

  const getDateRange = (period: string) => {
    const now = new Date();
    const start = new Date();
    
    switch(period) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      default:
        start.setHours(0, 0, 0, 0);
    }
    
    return { start, end: now };
  };

  const isDateInRange = (date: string, range: { start: Date; end: Date }) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0); // Normalize time to midnight
    return d >= range.start && d <= range.end;
  };

  const safeParseFloat = (value: string): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const updateStatistics = () => {
    const range = getDateRange(selectedPeriod);
    
    // Filter data based on date range
    const filteredStudents = students.filter(s => isDateInRange(s.date_of_registration, range));
    const filteredExams = exams.filter(e => isDateInRange(e.exam_date, range));
    const filteredPayments = payments.filter(p => isDateInRange(p.payment_date, range));
    
    // Calculate statistics
    const activeStudents = filteredStudents.filter(s => s.status === "active").length;
    const passedExams = filteredExams.filter(e => e.result === "pass").length;
    const totalPayments = filteredPayments.reduce((sum, p) => sum + safeParseFloat(p.amount), 0);
    
    // Calculate exam success rates
    const codeExams = filteredExams.filter(e => e.exam_type === "code");
    const drivingExams = filteredExams.filter(e => e.exam_type === "driving");
    const passedCodeExams = codeExams.filter(e => e.result === "pass").length;
    const passedDrivingExams = drivingExams.filter(e => e.result === "pass").length;
    
    const codeSuccessRate = codeExams.length > 0 ? (passedCodeExams / codeExams.length) * 100 : 0;
    const drivingSuccessRate = drivingExams.length > 0 ? (passedDrivingExams / drivingExams.length) * 100 : 0;
    const overallSuccessRate = filteredExams.length > 0 ? (passedExams / filteredExams.length) * 100 : 0;
    
    // Calculate payment statistics
    const cashPayments = filteredPayments.filter(p => p.payment_type === "cash");
    const cardPayments = filteredPayments.filter(p => p.payment_type === "card");
    const totalCashPayments = cashPayments.reduce((sum, p) => sum + safeParseFloat(p.amount), 0);
    const totalCardPayments = cardPayments.reduce((sum, p) => sum + safeParseFloat(p.amount), 0);
    
    setFilteredStats({
      students: {
        total: filteredStudents.length,
        active: activeStudents
      },
      exams: {
        total: filteredExams.length,
        passed: passedExams
      },
      payments: {
        total: totalPayments,
        cash: totalCashPayments,
        card: totalCardPayments
      },
      successRates: {
        overall: overallSuccessRate,
        code: codeSuccessRate,
        driving: drivingSuccessRate
      }
    });
  };

  // Fetch fresh data every 30 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, examsRes, paymentsRes] = await Promise.all([
          fetch('/api/students'),
          fetch('/api/exams'),
          fetch('/api/payments')
        ]);
        
        const [newStudents, newExams, newPayments] = await Promise.all([
          studentsRes.json(),
          examsRes.json(),
          paymentsRes.json()
        ]);
        
        setStudents(newStudents);
        setExams(newExams);
        setPayments(newPayments);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update statistics when period changes or when data changes
  useEffect(() => {
    updateStatistics();
  }, [selectedPeriod, students, exams, payments]);

  const handleExport = async () => {
    try {
      const zip = new JSZip();
      
      // Add CSV files to zip
      zip.file("students.csv", convertToCSV(formattedStudents));
      zip.file("exams.csv", convertToCSV(formattedExams));
      zip.file("payments.csv", convertToCSV(formattedPayments));
      
      // Generate and download zip file
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `statistics_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Une erreur est survenue lors de l'exportation des données.");
    }
  };

  const convertToCSV = (data: Record<string, any>[]): string => {
    if (data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return "";
        if (typeof value === "string" && value.includes(",")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    );
    
    return [headers.join(","), ...rows].join("\n");
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">Statistiques</h1>
          <p class="mt-2 text-sm text-gray-700">
            Vue d'ensemble des statistiques de l'auto-école.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod((e.target as HTMLSelectElement).value)}
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="day">Aujourd'hui</option>
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="year">12 derniers mois</option>
          </select>
        </div>
      </div>

      {/* Export button */}
      <div class="mt-4 flex space-x-4">
        <button
          onClick={handleExport}
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exporter toutes les données
        </button>
      </div>

      {/* Basic Statistics */}
      <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total des étudiants</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{filteredStats.students.total}</div>
                    <div class="ml-2 text-sm text-gray-500">dont {filteredStats.students.active} actifs</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total des examens</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{filteredStats.exams.total}</div>
                    <div class="ml-2 text-sm text-gray-500">dont {filteredStats.exams.passed} réussis</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Taux de réussite</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{filteredStats.successRates.overall.toFixed(1)}%</div>
                    <div class="ml-2 text-sm text-gray-500">global</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total des paiements</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{filteredStats.payments.total.toFixed(2)} DH</div>
                    <div class="ml-2 text-sm text-gray-500">total</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Exam Success Rates */}
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Taux de réussite par type d'examen</h3>
            <div class="mt-5">
              <dl class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div class="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                  <dt class="text-sm font-medium text-gray-500 truncate">Code</dt>
                  <dd class="mt-1 text-3xl font-semibold text-gray-900">{filteredStats.successRates.code.toFixed(1)}%</dd>
                </div>
                <div class="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                  <dt class="text-sm font-medium text-gray-500 truncate">Conduite</dt>
                  <dd class="mt-1 text-3xl font-semibold text-gray-900">{filteredStats.successRates.driving.toFixed(1)}%</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Payment Types */}
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Paiements par type</h3>
            <div class="mt-5">
              <dl class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div class="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                  <dt class="text-sm font-medium text-gray-500 truncate">Espèces</dt>
                  <dd class="mt-1 text-3xl font-semibold text-gray-900">{filteredStats.payments.cash.toFixed(2)} DH</dd>
                </div>
                <div class="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                  <dt class="text-sm font-medium text-gray-500 truncate">Carte</dt>
                  <dd class="mt-1 text-3xl font-semibold text-gray-900">{filteredStats.payments.card.toFixed(2)} DH</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 