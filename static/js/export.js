// Export functionality
document.addEventListener('DOMContentLoaded', () => {
  // Export all data button
  const exportAllButton = document.getElementById('export-all-btn');
  if (exportAllButton) {
    exportAllButton.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get data from button attributes
      const students = JSON.parse(exportAllButton.dataset.students);
      const exams = JSON.parse(exportAllButton.dataset.exams);
      const payments = JSON.parse(exportAllButton.dataset.payments);
      
      // Create a zip file containing all CSV files
      const zip = new JSZip();
      
      // Add students data
      const studentsCSV = convertToCSV(students);
      zip.file("etudiants.csv", studentsCSV);
      
      // Add exams data
      const examsCSV = convertToCSV(exams);
      zip.file("examens.csv", examsCSV);
      
      // Add payments data
      const paymentsCSV = convertToCSV(payments);
      zip.file("paiements.csv", paymentsCSV);
      
      // Create summary data for different time periods
      const summaryData = createSummaryData(students, exams, payments);
      const summaryCSV = convertToCSV(summaryData);
      zip.file("resume.csv", summaryCSV);
      
      // Generate and download the zip file
      zip.generateAsync({type: "blob"}).then(function(content) {
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', "auto-ecole-data.zip");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    });
  }
  
  // Helper function to convert data to CSV
  function convertToCSV(data) {
    if (data.length === 0) return "";
    
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV header row
    const csvRows = [headers.join(",")];
    
    // Add data rows
    for (const item of data) {
      const values = headers.map(header => {
        const value = item[header];
        // Handle special cases
        if (value === null || value === undefined) return "";
        if (typeof value === "object") return JSON.stringify(value);
        // Escape commas and quotes in string values
        if (typeof value === "string") {
          if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
        }
        return value;
      });
      csvRows.push(values.join(","));
    }
    
    return csvRows.join("\n");
  }
  
  // Function to create summary data for different time periods
  function createSummaryData(students, exams, payments) {
    const now = new Date();
    
    // Define time periods
    const periods = [
      { name: "Aujourd'hui", days: 0 },
      { name: "Cette semaine", days: 7 },
      { name: "Ce mois", days: 30 },
      { name: "Cette année", days: 365 }
    ];
    
    // Create summary data for each period
    return periods.map(period => {
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - period.days);
      
      // Filter data for this period
      const periodStudents = students.filter(s => {
        const date = new Date(s.date_of_registration);
        return date >= startDate && date <= now;
      });
      
      const periodExams = exams.filter(e => {
        const date = new Date(e.exam_date);
        return date >= startDate && date <= now;
      });
      
      const periodPayments = payments.filter(p => {
        const date = new Date(p.payment_date);
        return date >= startDate && date <= now;
      });
      
      // Calculate statistics
      const totalStudents = periodStudents.length;
      const activeStudents = periodStudents.filter(s => s.status === "Actif").length;
      const totalExams = periodExams.length;
      const passedExams = periodExams.filter(e => e.result === "Réussi").length;
      const successRate = totalExams > 0 ? (passedExams / totalExams) * 100 : 0;
      
      // Calculate income
      const totalIncome = periodPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const cashIncome = periodPayments
        .filter(p => p.payment_type === "cash")
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const cardIncome = periodPayments
        .filter(p => p.payment_type === "card")
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      return {
        periode: period.name,
        total_etudiants: totalStudents,
        etudiants_actifs: activeStudents,
        total_examens: totalExams,
        examens_reussis: passedExams,
        taux_reussite: successRate.toFixed(1) + "%",
        revenu_total: totalIncome.toFixed(2) + " DH",
        revenu_especes: cashIncome.toFixed(2) + " DH",
        revenu_carte: cardIncome.toFixed(2) + " DH"
      };
    });
  }
}); 