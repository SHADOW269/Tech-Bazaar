
/**
 * Utility for formatting currency and dates according to Indian standards.
 */

export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateIST = (date: Date | any): string => {
  if (!date) return 'N/A';
  
  // Handle Firestore Timestamps
  const d = date.toDate ? date.toDate() : new Date(date);
  
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(d);
};

export const cleanPhoneForWhatsApp = (phone: string): string => {
  // Remove non-digit characters and ensure it starts with 91
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return digits;
  return digits;
};
