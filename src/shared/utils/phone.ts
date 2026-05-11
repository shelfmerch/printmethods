export const sanitizeTenDigitPhone = (value: string | number | null | undefined): string => {
  return String(value ?? '').replace(/\D/g, '').slice(0, 10);
};

export const isTenDigitPhone = (value: string | number | null | undefined): boolean => {
  return sanitizeTenDigitPhone(value).length === 10;
};
