import { Month, Family, Category, Grant } from './types'

const generateMockGrants = (familyId: string, categoryIds: string[]): Grant[] => {
  const grants: Grant[] = []
  const statuses: Array<'APPROVED' | 'PENDING' | 'REJECTED' | 'PAID'> = ['APPROVED', 'PENDING', 'APPROVED', 'PAID']
  
  for (let i = 0; i < 3; i++) {
    grants.push({
      id: `grant-${familyId}-${i}`,
      familyId,
      categoryId: categoryIds[Math.floor(Math.random() * categoryIds.length)],
      amount: Math.floor(Math.random() * 500) + 100,
      date: new Date(2024, 0, Math.floor(Math.random() * 28) + 1).toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      notes: 'مساعدة عاجلة',
    })
  }
  return grants
}

const generateMockFamilies = (categoryIds: string[]): Family[] => {
  const firstNames = ['عائلة', 'أسرة', 'عشيرة']
  const lastNames = ['الأحمد', 'الحسن', 'الخالد', 'السالم', 'العتيبي', 'الدعيج', 'الهاجري', 'المطيري', 
                      'الجابر', 'الضويان', 'الشمري', 'الحويطي', 'العنزي', 'المري', 'الزعبي']
  const categories = ['أيتام', 'إعاقة', 'طالب علم', 'سجناء', 'مساعدات', 'دعم خارجي']
  const families: Family[] = []

  for (let i = 1; i <= 20; i++) {
    const familyId = `family-${i}`
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const calculatedAmount = Math.floor(Math.random() * 2000) + 800
    const externalTotal = Math.random() > 0.7 ? Math.floor(Math.random() * 500) : 0
    
    families.push({
      id: familyId,
      code: `REG${String(i).padStart(5, '0')}`,
      name: `${lastName}`,
      headOfHousehold: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastName}`,
      familySize: Math.floor(Math.random() * 6) + 3,
      monthlyIncome: Math.floor(Math.random() * 1500) + 500,
      totalGrants: Math.floor(Math.random() * 15) + 5,
      priority: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)] as 'HIGH' | 'MEDIUM' | 'LOW',
      category: categories[Math.floor(Math.random() * categories.length)],
      vulnerabilityScore: Math.floor(Math.random() * 100),
      calculatedAmount,
      externalTotal,
      compensationAmount: Math.max(0, calculatedAmount - externalTotal),
      manualAdjustment: 0,
      finalAmount: Math.max(0, calculatedAmount - externalTotal),
      meezaAmount: Math.floor(calculatedAmount * 0.3),
      meezaStatus: ['PENDING', 'PAID', 'FAILED'][Math.floor(Math.random() * 3)] as 'PENDING' | 'PAID' | 'FAILED',
      cashAmount: Math.floor(calculatedAmount * 0.7),
      cashStatus: ['PENDING', 'PAID', 'FAILED'][Math.floor(Math.random() * 3)] as 'PENDING' | 'PAID' | 'FAILED',
      address: `الشارع ${i}, الحي الجديد`,
      phone: `055${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      notes: `عائلة تحتاج إلى مساعدة في ${['الغذاء', 'المأوى', 'الرعاية الطبية'][Math.floor(Math.random() * 3)]}`,
      grants: generateMockGrants(familyId, categoryIds),
    })
  }

  return families
}

const generateMockCategories = (): Category[] => {
  const categoryTypes = ['FOOD', 'SHELTER', 'MEDICAL', 'EDUCATION', 'CLOTHING', 'UTILITIES']
  const labels = ['غذاء', 'مأوى', 'طبي', 'تعليم', 'ملابس', 'مرافق']
  
  return categoryTypes.map((type, idx) => {
    const budget = 5000 + Math.random() * 5000
    const spent = budget * (0.3 + Math.random() * 0.6)
    
    return {
      id: `cat-${type}`,
      name: labels[idx],
      type: type as any,
      budget,
      spent,
      limit: budget * 1.1,
    }
  })
}

export const generateMockMonths = (): Month[] => {
  const months: Month[] = []
  const categoryIds = generateMockCategories().map(c => c.id)
  
  for (let m = 0; m < 4; m++) {
    const date = new Date()
    date.setMonth(date.getMonth() - m)
    
    const categories = generateMockCategories()
    const families = generateMockFamilies(categoryIds)
    
    months.push({
      id: `month-${m}`,
      name: `${['يناير', 'فبراير', 'مارس', 'إبريل'][date.getMonth()]} ${date.getFullYear()}`,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      date: date.toISOString(),
      period: date.toISOString(),
      status: m === 0 ? 'CALCULATED' : m === 1 ? 'APPROVED' : 'ARCHIVED',
      method: Math.random() > 0.5 ? 'VULNERABILITY' : 'PROPORTIONAL',
      totalBudget: categories.reduce((sum, c) => sum + c.budget, 0),
      categories,
      families,
      createdAt: date.toISOString(),
    })
  }

  return months
}

export const mockMonths = generateMockMonths()
