const XLSX = require('xlsx');

/**
 * Parse uploaded Excel buffer into structured JS objects.
 * Returns { households, persons, incomeSources, healthRecords, burdens }
 * Each item includes _rowIndex for error reporting.
 */
function parseImportFile(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });

  function readSheet(name) {
    const ws = wb.Sheets[name];
    if (!ws) return [];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: false });
    return rows.map((row, i) => ({ ...row, _rowIndex: i + 2 })); // +2 = header row
  }

  return {
    households:   readSheet('الأسر'),
    persons:      readSheet('الأفراد'),
    incomeSources: readSheet('مصادر الدخل'),
    healthRecords: readSheet('الأمراض والإعاقات'),
    burdens:      readSheet('الأعباء المؤقتة'),
  };
}

module.exports = { parseImportFile };
