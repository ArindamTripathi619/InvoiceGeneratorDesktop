const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

function convertTwoDigits(num: number): string {
  if (num === 0) return '';
  if (num < 10) return ones[num];
  if (num >= 10 && num < 20) return teens[num - 10];
  return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
}

function convertThreeDigits(num: number): string {
  if (num === 0) return '';

  const hundred = Math.floor(num / 100);
  const remainder = num % 100;

  let result = '';
  if (hundred > 0) {
    result = ones[hundred] + ' Hundred';
  }

  if (remainder > 0) {
    if (result !== '') result += ' ';
    result += convertTwoDigits(remainder);
  }

  return result;
}

export function numberToWordsIndian(num: number): string {
  if (num === 0) return 'Zero Rupees Only';

  const wholePart = Math.floor(num);
  const decimalPart = Math.round((num - wholePart) * 100);

  if (wholePart === 0 && decimalPart > 0) {
    return convertTwoDigits(decimalPart) + ' Paise Only';
  }

  let result = '';

  const crore = Math.floor(wholePart / 10000000);
  let remainder = wholePart % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  const hundred = remainder;

  if (crore > 0) {
    result += convertTwoDigits(crore) + ' Crore ';
  }

  if (lakh > 0) {
    result += convertTwoDigits(lakh) + ' Lakh ';
  }

  if (thousand > 0) {
    result += convertTwoDigits(thousand) + ' Thousand ';
  }

  if (hundred > 0) {
    result += convertThreeDigits(hundred) + ' ';
  }

  result = result.trim() + ' Rupees';

  if (decimalPart > 0) {
    result += ' and ' + convertTwoDigits(decimalPart) + ' Paise';
  }

  result += ' Only';

  return result;
}

export function formatIndianCurrency(amount: number): string {
  return '₹ ' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function getCurrentFinancialYear(): string {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  if (currentMonth >= 4) {
    const nextYear = (currentYear + 1).toString().slice(-2);
    return `${currentYear.toString().slice(-2)}-${nextYear}`;
  } else {
    const prevYear = (currentYear - 1).toString().slice(-2);
    return `${prevYear}-${currentYear.toString().slice(-2)}`;
  }
}
