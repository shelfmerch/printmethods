function normalizePaise(value) {
  const amount = Math.round(Number(value || 0));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function minimumAdvancePaise(total) {
  return Math.ceil(Number(total || 0) * 100 * 0.5);
}

function totalPaise(total) {
  return Math.round(Number(total || 0) * 100);
}

function getQuotationPaymentStatus(total, paidPaise) {
  const paid = normalizePaise(paidPaise);
  if (paid <= 0) return null;
  return paid >= totalPaise(total) ? 'paid' : 'partially_paid';
}

function validateAdvanceAmount(total, amountPaise) {
  const amount = normalizePaise(amountPaise);
  const min = minimumAdvancePaise(total);
  const max = totalPaise(total);

  if (amount < min || amount > max) {
    return {
      valid: false,
      message: 'Payment amount must be between 50% advance and the quotation total',
      minPaise: min,
      maxPaise: max,
    };
  }

  return { valid: true, minPaise: min, maxPaise: max };
}

module.exports = {
  getQuotationPaymentStatus,
  minimumAdvancePaise,
  normalizePaise,
  totalPaise,
  validateAdvanceAmount,
};
