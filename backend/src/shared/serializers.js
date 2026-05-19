function decimalToString(value) {
  if (value == null) return null;
  if (typeof value === 'object' && typeof value.toString === 'function') {
    return value.toString();
  }
  return String(value);
}

function serializeIncomeSource(row) {
  if (!row) return row;
  return {
    ...row,
    monthlyAmount: decimalToString(row.monthlyAmount),
  };
}

function serializePerson(row) {
  if (!row) return row;
  return {
    ...row,
    prisonSuspicion: decimalToString(row.prisonSuspicion),
    birthDate: row.birthDate?.toISOString?.() ?? row.birthDate,
    diseases: row.diseases?.map((d) => ({ ...d })),
    disabilities: row.disabilities?.map((d) => ({ ...d })),
  };
}

function serializeHousehold(row) {
  if (!row) return row;
  return {
    ...row,
    persons: row.persons?.map(serializePerson),
    incomeSources: row.incomeSources?.map(serializeIncomeSource),
    scoreResults: row.scoreResults?.map((s) => ({
      ...s,
      vulnerabilityScore: decimalToString(s.vulnerabilityScore),
      reductionScore: decimalToString(s.reductionScore),
      confidenceScore: decimalToString(s.confidenceScore),
      fraudRiskScore: decimalToString(s.fraudRiskScore),
      finalScore: decimalToString(s.finalScore),
      normalizedPercent: decimalToString(s.normalizedPercent),
    })),
  };
}

module.exports = {
  serializeHousehold,
  serializePerson,
  serializeIncomeSource,
  decimalToString,
};
