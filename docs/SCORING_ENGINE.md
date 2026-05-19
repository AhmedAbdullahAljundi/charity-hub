# Scoring Engine

The Charity Hub Scoring Engine evaluates households through a deterministic, layered pipeline.

## The 8 Layers
1. **L1: Base Vulnerability**: Core demographic score based on age, gender, and family structure.
2. **L2: Dependents & Roles**: Additional weight for specific vulnerable members (e.g., orphans, widows).
3. **L3: Housing & Assets**: Points derived from housing conditions, rent type, and owned assets.
4. **L4: Extreme Vulnerability**: Heavy weighting for critical conditions (e.g., severe disability, terminal illness).
5. **L5: Temporary Burdens**: Adjustments for current debt, high utility bills, or education expenses.
6. **L6: Social Status Adjustment**: Adjustments based on employment stability and marital status of the head of household.
7. **L7: Economic Corrections (Negative)**: Reductions applied for signs of affluence (e.g., luxury assets, high utility consumption).
8. **L8: Income Verification (Negative)**: Final reduction based on verified external income sources against self-reported income.

## Pipeline Flow
1. **Normalize**: Data from Prisma is transformed into a flat, predictable `NormalizedHouseholdInput`.
2. **Evaluate**: The 8 layers are processed sequentially. Intermediate values are tracked in `layerResults`.
3. **Aggregate**: Sub-scores (Vulnerability, Reduction, Confidence) are combined into a `finalScore` and mapped to a `normalizedPercent` (0-100%).
4. **Fraud Check**: L8 triggers are evaluated to determine if a `FraudRisk` flag should force a manual review.
5. **Explain**: The top positive and negative factors are extracted to generate human-readable `recommendations` and `warnings`.
6. **Snapshot**: The exact state of the input and weights are frozen into a JSON snapshot and saved immutably with the `ScoreResult`.

## Simulation Sandbox
The `/api/simulate` endpoint bypasses the persistence layer, injecting a mock `patch` over the normalized input, running the engine, and returning the `scoreDelta`.
