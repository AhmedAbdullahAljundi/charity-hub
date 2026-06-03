const { runScoringEngine } = require('./src/domains/scoring/engine/engine');

const testInput = {
  householdId: 'test',
  flags: {
    absenceReason: 'ABSENT_PRISON',
    hasWidow: false,
    displacedCount: 0,
    hasBride: false,
    brideSponsor: false,
    noRationCard: false,
    noProvider: true
  },
  persons: [
    {
      id: '1',
      role: 'HEAD',
      isHead: true,
      residencyStatus: 'ABSENT_PRISON',
      prisonTerm: 'LONG',
      prisonSuspicion: 'MEDIUM',
      diseases: [],
      disabilities: []
    },
    {
      id: '2',
      role: 'SPOUSE',
      residencyStatus: 'RESIDENT',
      age: 40,
      diseases: [],
      disabilities: []
    }
  ],
  temporaryBurdens: [],
  incomeSources: [],
  socialStatus: 'MARRIED',
  housingType: 'OWNED'
};

try {
  const result = runScoringEngine(testInput);
  console.log("Vulnerability Score:", result.vulnerabilityScore);
  console.log("Details:");
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error(err);
}
