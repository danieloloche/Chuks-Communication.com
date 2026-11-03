// Utility to convert numbers into English words for invoice/receipt total
const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertLessThanOneThousand(num: number): string {
  if (num === 0) return '';
  let result = '';

  if (num >= 100) {
    result += `${ones[Math.floor(num / 100)]} Hundred`;
    num %= 100;
    if (num > 0) result += ' and ';
  }

  if (num >= 20) {
    result += tens[Math.floor(num / 10)];
    num %= 10;
    if (num > 0) result += `-${ones[num]}`;
  } else if (num > 0) {
    result += ones[num];
  }

  return result;
}

export function formatNairaInWords(amount: number): string {
  if (!amount || isNaN(amount) || amount <= 0) {
    return 'Zero Naira Only';
  }

  const rounded = Math.floor(amount);
  if (rounded === 0) return 'Zero Naira Only';

  const billions = Math.floor(rounded / 1000000000);
  const millions = Math.floor((rounded % 1000000000) / 1000000);
  const thousands = Math.floor((rounded % 1000000) / 1000);
  const remainder = rounded % 1000;

  const parts: string[] = [];

  if (billions > 0) {
    parts.push(`${convertLessThanOneThousand(billions)} Billion`);
  }
  if (millions > 0) {
    parts.push(`${convertLessThanOneThousand(millions)} Million`);
  }
  if (thousands > 0) {
    parts.push(`${convertLessThanOneThousand(thousands)} Thousand`);
  }
  if (remainder > 0) {
    parts.push(convertLessThanOneThousand(remainder));
  }

  return `${parts.join(', ')} Naira Only`;
}
