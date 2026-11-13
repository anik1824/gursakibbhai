const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBn = (v: string | number) => String(v).replace(/[0-9]/g, (d) => BN_DIGITS[+d]);

export const toEnDigits = (v: string) => v.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

export const bnMoney = (n: number) => toBn(Math.round(n).toLocaleString('en-IN'));

export const normalizePhone = (p: string) => {
  const digits = toEnDigits(p).replace(/[^0-9]/g, '');
  return digits.replace(/^880?/, '0');
};

export const isValidBdPhone = (p: string) => /^01[3-9][0-9]{8}$/.test(normalizePhone(p));

export const errorMessage = (e: unknown) => {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message);
  return 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন';
};

export const whatsappLink = (number: string, text?: string) =>
  `https://wa.me/${normalizePhone(number).replace(/^0/, '880')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const telLink = (phone: string) => `tel:${normalizePhone(phone)}`;
