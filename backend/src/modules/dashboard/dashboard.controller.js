/**
 * Dashboard Controller
 * Returns aggregated stats for the main dashboard
 */

const prisma = require('../../config/prisma')

const dashboardController = {
    getStats: async (req, res, next) => {
        try {
            // Run all queries in parallel for performance
            const [
                totalFamilies,
                scoringAggregate,
                classificationCounts,
                criticalMedical,
                incompleteFamilies,
                allExpenses
            ] = await Promise.all([
                // Total number of registered families
                prisma.family.count(),

                // Aggregate latest scoring per family for total income and avg vulnerability
                prisma.scoring.findMany({
                    distinct: ['family_id'],
                    orderBy: { calculated_at: 'desc' },
                    select: {
                        family_id: true,
                        total_income: true,
                        total_need: true,
                        vulnerability_index: true,
                        classification: true,
                    },
                }),

                // Count by classification (latest scoring per family)
                prisma.scoring.groupBy({
                    by: ['classification'],
                    _count: { classification: true },
                    orderBy: { classification: 'asc' },
                }),

                // Count of medical cases with CRITICAL severity
                prisma.medicalCase.count({
                    where: {
                        OR: [
                            { disease_severity: 'CRITICAL' },
                            { chronic: true },
                        ],
                    },
                }),

                // Incomplete families (No members or no scoring)
                prisma.family.count({
                    where: {
                        OR: [
                            { persons: { none: {} } },
                            { scoringRecords: { none: {} } }
                        ]
                    }
                }),

                // Get all expenses to group them by family and then classification
                prisma.expense.findMany({
                    select: { family_id: true, amount: true }
                })
            ])

            // Compute total income and total need from latest scoring records
            const totalIncome = scoringAggregate.reduce(
                (sum, s) => sum + parseFloat(s.total_income?.toString() || '0'), 0
            )
            const totalNeed = scoringAggregate.reduce(
                (sum, s) => sum + parseFloat(s.total_need?.toString() || '0'), 0
            )
            const avgVulnerability =
                scoringAggregate.length > 0
                    ? scoringAggregate.reduce(
                        (sum, s) => sum + parseFloat(s.vulnerability_index?.toString() || '0'), 0
                    ) / scoringAggregate.length
                    : 0

            // Map classification counts to Arabic labels
            const arabicLabels = {
                VERY_FRAGILE: 'هش للغاية (حرج)',
                FRAGILE: 'هش للغاية',
                WEAK: 'ضعيف',
                MODERATE: 'متوسط',
                OUT_OF_PRIORITY: 'خارج الأولوية',
            }
            const chartColors = {
                VERY_FRAGILE: 'var(--color-destructive)',
                FRAGILE: '#ef4444',
                WEAK: 'var(--color-warning)',
                MODERATE: 'var(--color-chart-4)',
                OUT_OF_PRIORITY: 'var(--color-muted-foreground)',
            }

            const familyClassification = classificationCounts.map((c) => ({
                name: arabicLabels[c.classification] || c.classification,
                value: c._count.classification,
                fill: chartColors[c.classification] || '#888',
                key: c.classification,
            }))

            // Critical families calculate
            const criticalFamilies = scoringAggregate.filter(s => s.classification === 'VERY_FRAGILE' || s.classification === 'FRAGILE').length;

            // Expenses by classification
            const expensesMap = {};
            allExpenses.forEach(exp => {
                const amt = parseFloat(exp.amount?.toString() || '0');
                expensesMap[exp.family_id] = (expensesMap[exp.family_id] || 0) + amt;
            });

            const classificationExpensesArray = Object.keys(arabicLabels).map(key => {
                const totalForClass = scoringAggregate
                    .filter(s => s.classification === key)
                    .reduce((sum, s) => sum + (expensesMap[s.family_id] || 0), 0);
                return {
                    name: arabicLabels[key],
                    value: totalForClass,
                    fill: chartColors[key],
                    key
                };
            }).filter(item => item.value > 0);

            res.json({
                success: true,
                data: {
                    stats: {
                        totalFamilies,
                        incompleteFamilies,
                        criticalFamilies,
                        totalIncome: Math.round(totalIncome),
                        totalNeed: Math.round(totalNeed),
                        vulnerabilityIndex: parseFloat(avgVulnerability.toFixed(4)),
                        criticalMedical,
                    },
                    familyClassification,
                    classificationExpenses: classificationExpensesArray
                },
            })
        } catch (error) {
            next(error)
        }
    },
}

module.exports = dashboardController
