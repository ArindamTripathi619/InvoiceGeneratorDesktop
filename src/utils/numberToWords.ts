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

const denominations = [
  { value: 100000000000, name: 'Kharab' },
  { value: 1000000000, name: 'Arab' },
  { value: 10000000, name: 'Crore' },
  { value: 100000, name: 'Lakh' },
  { value: 1000, name: 'Thousand' },
];

function convertBelowThousand(num: number): string {
  if (num === 0) return '';
  if (num < 100) return convertTwoDigits(num);
  return convertThreeDigits(num);
}

export function numberToWordsIndian(num: number): string {
  if (num === 0) return 'Zero Rupees Only';

  const wholePart = Math.floor(num);
  const decimalPart = Math.round((num - wholePart) * 100);

  if (wholePart === 0 && decimalPart > 0) {
    return convertTwoDigits(decimalPart) + ' Paise Only';
  }

  let result = '';
  let remainder = wholePart;

  for (const denom of denominations) {
    const unitValue = Math.floor(remainder / denom.value);
    if (unitValue > 0) {
      // For denominations like Crore, we might have more than 99 (e.g. 125 Crore)
      // So we use convertBelowThousand or similar
      result += (unitValue < 100 ? convertTwoDigits(unitValue) : convertThreeDigits(unitValue)) + ' ' + denom.name + ' ';
      remainder %= denom.value;
    }
  }

  if (remainder > 0) {
    result += convertBelowThousand(remainder) + ' ';
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
