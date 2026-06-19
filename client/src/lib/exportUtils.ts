import XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Export data to Excel (.xlsx)
 */
export function exportToExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export data to CSV
 */
export function exportToCSV(data: any[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format client data for export
 */
export function formatClientsForExport(clients: any[]) {
  return clients.map((client) => ({
    'שם הלקוח': client.name,
    'סוג השירות': client.serviceType,
    'סטטוס': client.status,
    'קוד לקוח': client.clientCode || '',
    'טלפון': client.phone || '',
    'אימייל': client.email || '',
    'סכום חודשי': client.monthlyAmount || '',
    'תאריך תשלום': client.paymentDate || '',
    'מקור': client.source || '',
    'הערות': client.notes || '',
    'תאריך התחלה': client.startDate ? new Date(client.startDate).toLocaleDateString('he-IL') : '',
  }));
}

/**
 * Format transaction data for export
 */
export function formatTransactionsForExport(transactions: any[]) {
  return transactions.map((transaction) => ({
    'סוג': transaction.type === 'revenue' ? 'הכנסה' : 'הוצאה',
    'קטגוריה': transaction.category || '',
    'סכום': transaction.amount || '',
    'תיאור': transaction.description || '',
    'תאריך': transaction.date ? new Date(transaction.date).toLocaleDateString('he-IL') : '',
    'חודש': transaction.month || '',
    'שנה': transaction.year || '',
    'הערות': transaction.notes || '',
  }));
}

/**
 * Format leads data for export
 */
export function formatLeadsForExport(leads: any[]) {
  return leads.map((lead) => ({
    'שם הליד': lead.name,
    'טלפון': lead.phone || '',
    'אימייל': lead.email || '',
    'מקור': lead.source || '',
    'שלב': lead.stage || '',
    'סטטוס': lead.status || '',
    'ערך משוער': lead.estimatedValue || '',
    'הערות': lead.notes || '',
    'תאריך יצירה': lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('he-IL') : '',
  }));
}

/**
 * Format team members data for export
 */
export function formatTeamForExport(team: any[]) {
  return team.map((member) => ({
    'שם': member.name,
    'תפקיד': member.role || '',
    'דרג': member.position || '',
    'מחלקה': member.department || '',
    'טלפון': member.phone || '',
    'אימייל': member.email || '',
    'משכורת': member.salary || '',
    'סטטוס': member.status || '',
    'הערות': member.notes || '',
  }));
}
