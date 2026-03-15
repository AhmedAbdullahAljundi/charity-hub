# CharityHub - Workflow Documentation / توثيق سير العمل

## English Version

### Overview
CharityHub is a comprehensive charity management system designed to manage beneficiaries, donors, volunteers, and staff workflows for a charitable organization.

### Complete Workflow

#### 1. Beneficiary Registration Process

**Step 1: Initial Application**
- Beneficiary submits required documents to a staff member at the organization's headquarters
- Staff member reviews the documents

**Step 2: Data Entry**
- Staff member registers basic beneficiary information from submitted documents:
  - Name, phone number, address, national ID
  - Children information
  - Employment status
  - Education levels of children
  - Income sources
  - Other available data from the beneficiary

**Step 3: Document Scanning**
- Staff takes photos of documents
- Documents are compiled into a PDF
- PDF is named after the wife (as she is the most frequent visitor)
- PDF is used for data review, verification, and correction

**Step 4: Field Visit**
- Staff assigns a volunteer for a home visit
- Volunteer collects information about family members
- Volunteer verifies information provided by the beneficiary

**Step 5: Management Meeting**
- Management committee holds a meeting
- Decision is made regarding the family:
  - Monthly financial assistance
  - Monthly medical assistance
  - Seasonal assistance (holidays/occasions) - food or financial or both
- Family is classified into appropriate category:
  - Orphan families
  - Divorced families
  - Poor families
  - Needy families
  - Disability families
  - Student families (many children in education, head unable to cover expenses)
  - Prisoner families
  - Elderly
  - Cases of abandonment/disappearance of husband
  - Chronic diseases
  - Temporary injuries (fractures, falls preventing work)
  - Other cases (with reasons documented)

**Step 6: Data Verification**
- Data entry staff confirms verified data
- Corrects manipulated data from families
- Requests income documentation:
  - Insurance stamps for pensions
  - Takaful and Karama
  - Investigation if family receives assistance from other charities
  - Family support from relatives (documented as support 1, 2, 3, etc.)

#### 2. Income Sources Classification

**Income Sources Include:**
- Family support 1, 2, 3
- Charity assistance 1, 2
- Monthly food assistance
- Income from projects and real estate
- Insurance and pensions
- Takaful and Karama
- Monthly income from working children
- Income-generating activities (husband/wife)
- Ration card
- Daily smoking cost (multiplied by 30 as deterrent)
- Merged elderly cases (combined income)
- Divorce alimony
- Monthly food assistance (fixed)
- Government assistance (Takaful, Karama, etc.)
- Projects generating income
- Bank deposits and interest
- Vehicles (tuk-tuk, car)
- Shops or properties generating income
- Working housewife (nature of work, average income)
- Children's national IDs, education levels, employment status
- Income sufficiency assessment

#### 3. Expense Tracking

**Expenses Include:**
- Rent value (if applicable)
- Monthly treatment cost (if applicable)
- Monthly education cost for children
- Treatment travel costs (if applicable)
- Marriage preparation costs (orphans receive larger amounts, others receive less)

#### 4. PMT (Proxy Means Test) Scoring System

**Baseline Selection:**
- Baseline for rural areas: 5000 (example)

**Family Need Coefficient Calculation:**

**A. Head of Household Coefficient (by age):**
- 0.7 to 1.5 based on age
- Example: 45 years = 0.7
- 55-65 years = 1.1
- Over 65 years = 1.5
- More ranges can be added

**B. Adult Coefficients:**
- Working full-time: 0.4
- Part-time: 0.6
- Housewife only: 0.8
- Other adults: similar logic

**C. Children Under 15 (not in education):**
- Coefficient: 0.5

**D. Education Level Coefficients:**
- Nursery: 0.6
- Primary: 0.7
- Preparatory: 0.85
- Secondary: 1.2
- University: 0.95
- Marriageable age daughter (unmarried): 0.8 (for marriage preparation burden, separate from 50K bonus)

**E. Chronic Disease Coefficients:**
- Range: 0 to 1.2
- Based on:
  - Cost impact
  - Work disruption
  - Disease severity

**F. Disability Coefficients:**
- Range: 0 to 1.2
- Based on:
  - Work impact
  - Need for caregiver
  - Expenses

**G. Housing Coefficients:**
- Rent: 0.5
- Shared rent: 0.2
- Unknown family support: 0.3 to 0.5 (estimated)

**H. Family Status Coefficients:**
- Head deceased: 0.9
- Divorced without alimony: 0.7
- With alimony: 0.4
- Head in prison:
  - Short term (months): 0.5
  - Medium (less than 2 years): 0.8
  - Long term (more than 2 years): 1.1
- Child in prison: 0.5
- Temporary injury: 0 to 1 (based on duration and impact)
- Commercial/Industrial secondary (not general/Azhar): 0.6 for boys, 0.9 for girls

**I. Employment Coefficients (Head):**
- Irregular work due to injury: -0.5
- Irregular work: -1
- Regular work: -1.5
- Traveling: -3

**J. Children Employment Coefficients:**
- Single son in same house:
  - Irregular: -0.5
  - Regular: -1
  - Traveling: -2
- If living outside house: half values
- Married son in same house:
  - Irregular: -0.4
  - Regular: -0.8
  - Traveling: -1.5
- If outside house: half values

**K. Other Coefficients:**
- Unknown bank deposit interest: -0.5
- Ex-husband support above alimony: -0.3

**Final Calculation:**
- Sum all coefficients
- Calculate estimated living standard = Baseline / number of units (coefficients)
- Calculate actual living standard = Actual income / number of units
- Vulnerability Index = Actual living standard / Estimated living standard
- Classification ranges:
  - Very Fragile (هش للغاية)
  - Fragile (هش)
  - Weak (ضعيف)
  - Moderate (متوسط)
  - Out of Priority (خارج الأولوية)

**Special Classification:**
- Orphan families separated
- Divorced families separated
- Prisoner families separated
- Poor families separated
- Other categories separated

**Age Rules:**
- Under 15: treated as child
- Over 15 (girls): dependent until marriage
- Over 15 (boys): dependent until education completion, otherwise independent

#### 5. Medical Services System

**Service Types:**
- Monthly treatment
- Seasonal treatment

**Fields:**
- Family code
- Family classification
- Husband and wife names (from family code)
- Support type:
  - Doctor visit
  - Tests
  - Treatment
  - X-rays
- Center/doctor name
- Price
- Patient name in family
- Disease name
- Date field (with today's date default, editable)
- Notes field

**Service Rules:**
- Seasonal: One service every 40 days (warning if violated)
- Monthly: Treatment every 25 days
- Doctor visit/test/X-ray: Same rules apply

**Disease Classification:**

**Category A (Simple, Non-Affecting):**
- Characteristics:
  1. Simple non-affecting disease
  2. Non-periodic treatment
  3. Limited cost
  4. Does not prevent work
- Examples: Mild hypertension, anemia, allergies, mild ulcers, cold, headache
- Points: 0

**Category B (Moderate, Non-Livable):**
- Characteristics:
  1. Moderate disease, not livable
  2. Periodic treatment, not expensive
  3. Needs periodic follow-up (specific months)
  4. Partially affects work
- Examples: Affecting diabetes, chronic hypertension, rheumatism, kidney failure without dialysis, dormant cancer
- Points: 0.5

**Category C (Serious, Debilitating):**
- Characteristics:
  1. Serious debilitating disease
  2. Periodic expensive treatment
  3. Needs close periodic follow-up
  4. Needs caregiver
  5. Cannot work due to disease
- Examples: Dialysis, liver failure, active cancer, repeated surgeries, paralysis
- If hospital sessions and severe condition needing nurse and specialists: 1.2
- If periodic treatment with scattered follow-up (2-3 times monthly): 0.9

**Disability Classification:**

**Category A (Mild Disability):**
- Does not prevent work
- Does not need caregiver
- No medications
- Examples: Mild hearing loss, mild vision loss (correctable), minor deformities
- Points: 0.2

**Category B (Moderate Disability):**
- Partially affects work (not completely)
- Does not need caregiver
- Medications not expensive
- Examples: Partial amputation, partial paralysis, severe vision loss
- Points: 0.5

**Category C (Severe Disability):**
- Prevents work
- Depends on others for movement
- Examples: Hemiplegia, mental disability, blind
- Points: 0.8 or 1 (based on treatment)

**Category D (Complete Disability):**
- Cannot move or do any work
- Needs permanent caregiver
- Examples: Quadriplegia, severe mental retardation, complete atrophy
- Points: 1.2

#### 6. Financial Assistance Calculation

**Classification Codes:**
- 1: Sponsorship (كفالة)
- 2: Disability (إعاقة)
- 3: Student (طالب علم - many children in education, head cannot cover expenses)
- 4: Prisoners (السجناء)
- 5: Poor (الفقراء)
- 6: Donor gives money through organization, organization doesn't see priority
- 7: Elderly (كبار السن)
- Individual cases living alone

**Payment Method:**
- Via Meeza Visa through bank
- Beneficiary creates Visa, organization gets number
- Bank provides access to site for money transfer
- Condition: Amounts must not exceed 4 digits (except totals which can be more)

#### 7. Access Levels

**Admin Access:**
- Full access to everything
- Excel export for all data

**Medical Volunteers Access:**
- Access to medical services payment system only

**Data View Volunteers:**
- View family data only

**Data Entry Volunteers:**
- Enter and edit family data

**Field Research Volunteers:**
- Fill field research forms (paper or digital)

#### 8. Features Required

**Family Search Page:**
- Display all family data in one concise page
- Use pseudo-elements for page layout
- Include all family data

**Educational Follow-up Page:**
- Proof of enrollment each year
- Results each term
- Calculate student level based on levels
- Quran memorization tracking:
  - Student level
  - Stopped at which surah
  - Every 3 months
  - Create ranges

**Data Separation:**
- Separate family data from children data in entry and display

**Comparison Feature:**
- Compare field research with office research
- Show commonalities (not exact, but relatively)

**Distribution Management:**
- Money distribution
- Clothing distribution (if available)
- Food bag distribution
- In-kind donations distribution
- Excel sheet by selecting family classification
- Choose most priority families
- Record of family receipts
- Reports on living standard levels
- Coverage assessment reports

**Dashboard:**
- Urgent cases for quick action
- Benefited cases
- Rejected cases
- Under research cases
- Awaiting committee discussion
- Missing data cases

**Distribution Records:**
- In-kind distribution records
- Financial distribution (using old formula, codes for each classification)

---

## النسخة العربية

### نظرة عامة
CharityHub هو نظام شامل لإدارة الجمعيات الخيرية مصمم لإدارة سير عمل المستفيدين والمتبرعين والمتطوعين وطاقم العمل.

### سير العمل الكامل

#### 1. عملية تسجيل المستفيد

**الخطوة 1: التقديم الأولي**
- يقدم المستفيد الأوراق المطلوبة لأحد أفراد الطاقم في مقر الجمعية
- يقوم أحد أفراد الطاقم بمراجعة الأوراق

**الخطوة 2: إدخال البيانات**
- يقوم أحد أفراد الطاقم بتسجيل البيانات الأساسية للمستفيد من الأوراق المقدمة:
  - الاسم ورقم الهاتف والعنوان والرقم القومي
  - معلومات الأولاد
  - الحالة الوظيفية
  - المستويات الدراسية للأولاد
  - مصادر الدخل
  - بيانات أخرى متاحة من المستفيد

**الخطوة 3: مسح المستندات**
- يقوم الطاقم بأخذ صور للمستندات
- يتم تجميع المستندات في ملف PDF
- يتم تسمية PDF باسم الزوجة (لأنها الأكثر تردداً)
- يتم استخدام PDF لمراجعة وتوثيق البيانات والتصحيح

**الخطوة 4: الزيارة المنزلية**
- يقوم الطاقم بتكليف أحد المتطوعين بزيارة منزلية
- يجمع المتطوع معلومات عن أفراد هذه الأسرة
- يتأكد المتطوع من المعلومات التي قالها المستفيد

**الخطوة 5: اجتماع الإدارة**
- يعقد اجتماع لأعضاء إدارة الجمعية
- يتم اتخاذ قرار بشأن هذه الأسرة:
  - مساعدات مادية شهرية
  - مساعدات شهرية علاجية
  - مساعدات موسمية (في المناسبات) - غذائية أو مادية أو الاثنين معاً
- يتم تصنيف الأسرة في الفئة المناسبة:
  - أسر الأيتام
  - المطلقات
  - الفقراء
  - المساكين
  - أسر الإعاقة
  - طالب العلم (أولاد كتير بيتعلموا، العائل مش قادر يغطي المصاريف)
  - أسر السجناء
  - كبار السن
  - حالات هجر واختفاء الزوج
  - أمراض مزمنة
  - إصابات مؤقتة (كسور، سقوط يعجز عن العمل)
  - حالات أخرى (مع توثيق الأسباب)

**الخطوة 6: التحقق من البيانات**
- يقوم موظف إدخال البيانات بتأكيد البيانات المؤكدة
- يصحح البيانات التي تم التلاعب بها من قبل الأسر
- يطلب توثيقات للدخل:
  - الطابع التأميني للمعاشات
  - تكافل وكرامة
  - التحقق إذا كانت الأسرة تأخذ معاش من جمعيات خيرية أخرى
  - الدعم العائلي من الأقارب (يُوثق كدعم 1، 2، 3، إلخ)

#### 2. تصنيف مصادر الدخل

**مصادر الدخل تشمل:**
- مساعدات أهالي 1، 2، 3
- مساعدات جمعية خيرية 1، 2
- مساعدات غذائية شهرية
- دخل من مشاريع وعقارات
- التأمينات والمعاشات
- تكافل وكرامة
- شهريات الأبناء العاملين
- الأنشطة المكسبة للمال (للزوج/الزوجة)
- بطاقة التموين
- تمن التدخين اليومي (مضروب في 30 للردع)
- حالات دمج كبار السن (دخل مجمع)
- نفقة المطلقات
- مساعدات غذائية شهرية (ثابت)
- مساعدات الدولة (تكافل، كرامة، إلخ)
- مشاريع تدر دخل
- ودائع البنوك والفوائد
- وسائل نقل (توكتوك، عربية)
- محلات أو أملاك تدر دخل
- ربة الأسرة عاملة (طبيعة العمل، متوسط الدخل)
- أرقام الأولاد القومية، مستوياتهم التعليمية، حالة العمل
- تقييم كفاية الدخل

#### 3. تتبع المصروفات

**المصروفات تشمل:**
- قيمة الإيجار (إن وجد)
- تكلفة العلاج الشهري (إن وجد)
- تكلفة التعليم الشهري للأولاد
- تكاليف مشاوير العلاج (إن وجد)
- تكاليف تجهيز الزواج (الأيتام يحصلون على مبلغ أكبر، الآخرون أقل)

#### 4. نظام التقييم PMT (Proxy Means Test)

**اختيار Baseline:**
- Baseline للمناطق الريفية: 5000 (مثال)

**حساب معامل احتياج الأسرة:**

**أ. معامل رب الأسرة (حسب السن):**
- من 0.7 إلى 1.5 حسب السن
- مثال: 45 سنة = 0.7
- 55-65 سنة = 1.1
- فوق 65 سنة = 1.5
- يمكن إضافة نطاقات أكثر

**ب. معاملات البالغين:**
- عاملة دائماً: 0.4
- جزئي: 0.6
- ربة منزل فقط: 0.8
- بالغين آخرين: نفس المنطق

**ج. طفل أقل من 15 (لا يتعلم):**
- المعامل: 0.5

**د. معاملات المستوى التعليمي:**
- حضانة: 0.6
- ابتدائي: 0.7
- إعدادي: 0.85
- ثانوي: 1.2
- جامعي: 0.95
- بنت بسن الزواج (لم تتزوج): 0.8 (لعبء التجهيز، منفصل عن مكافأة 50 ألف)

**هـ. معاملات الأمراض المزمنة:**
- النطاق: 0 إلى 1.2
- يعتمد على:
  - تأثير التكلفة
  - تعطيل العمل
  - شدة المرض

**و. معاملات الإعاقة:**
- النطاق: 0 إلى 1.2
- يعتمد على:
  - تأثير العمل
  - الحاجة لمرافق
  - المصاريف

**ز. معاملات السكن:**
- إيجار: 0.5
- إيجار مشترك: 0.2
- دعم عائلي مجهول: 0.3 إلى 0.5 (مقدر)

**ح. معاملات حالة الأسرة:**
- العائل متوفي: 0.9
- مطلقة بدون نفقة: 0.7
- مع نفقة: 0.4
- العائل في السجن:
  - مدة بسيطة (بالشهور): 0.5
  - متوسطة (أقل من سنتين): 0.8
  - طويلة (أكثر من سنتين): 1.1
- الابن مسجون: 0.5
- إصابة مؤقتة: 0 إلى 1 (حسب المدة والتأثير)
- ثانوي تجاري/صناعي (ليس عام/أزهري): 0.6 للولد، 0.9 للبنت

**ط. معاملات العمل (رب الأسرة):**
- عمل غير منتظم بسبب إصابة: -0.5
- عمل غير منتظم: -1
- عمل منتظم: -1.5
- مسافر: -3

**ي. معاملات عمل الأبناء:**
- ابن أعزب في نفس البيت:
  - غير منتظم: -0.5
  - منتظم: -1
  - مسافر: -2
- إذا سكنه خارج البيت: نصف القيم
- ابن متزوج في نفس البيت:
  - عمل غير منتظم: -0.4
  - منتظم: -0.8
  - مسافر: -1.5
- إذا خارج البيت: نصف القيم

**ك. معاملات أخرى:**
- فوائد ودائع بنك مجهولة: -0.5
- دعم الطليق فوق النفقة: -0.3

**الحساب النهائي:**
- جمع جميع المعاملات
- حساب مستوى المعيشة التقديري = Baseline / عدد الوحدات (المعاملات)
- حساب مستوى المعيشة الفعلي = الدخل الفعلي / عدد الوحدات
- مؤشر الهشاشة = مستوى المعيشة الفعلي / مستوى المعيشة التقديري
- نطاقات التصنيف:
  - هش للغاية
  - هش
  - ضعيف
  - متوسط
  - خارج الأولوية

**التصنيف الخاص:**
- فصل أسر الأيتام
- فصل أسر المطلقات
- فصل أسر السجناء
- فصل الأسر الفقيرة
- فصل الفئات الأخرى

**قواعد السن:**
- أقل من 15: يُعامل كطفل
- فوق 15 (بنات): مكفولة حتى الزواج
- فوق 15 (أولاد): مكفول حتى انتهاء التعليم، وإلا مستقل

#### 5. نظام الخدمات الطبية

**أنواع الخدمات:**
- علاج شهري
- علاج موسمي

**الحقول:**
- كود الأسرة
- تصنيف الأسرة
- اسم الزوج والزوجة (من كود الأسرة)
- نوع الدعم:
  - كشف طبيب
  - تحاليل
  - علاج
  - أشعة
- اسم المركز/الطبيب
- السعر
- اسم المريض في الأسرة
- اسم المرض
- حقل التاريخ (مع تاريخ اليوم كافتراضي، قابل للتعديل)
- حقل الملاحظات

**قواعد الخدمة:**
- موسمي: خدمة واحدة كل 40 يوم (تحذير إذا تم انتهاكها)
- شهري: صرف علاج كل 25 يوم
- كشف/تحليل/أشعة: نفس القواعد

**تصنيف الأمراض:**

**الفئة أ (بسيط، غير مؤثر):**
- الخصائص:
  1. مرض بسيط غير مؤثر
  2. علاج غير دوري
  3. تكلفة محدودة
  4. لا يمنع العمل
- أمثلة: ضغط خفيف، أنيميا، حساسية، قرحة بسيطة، برد، صداع
- النقاط: 0

**الفئة ب (متوسط، غير قابل للتعايش):**
- الخصائص:
  1. مرض متوسط غير قابل للتعايش
  2. علاج دوري غير مكلف
  3. يحتاج متابعة دورية (شهور معينة)
  4. يؤثر جزئياً على العمل
- أمثلة: سكر مؤثر، ضغط مزمن، روماتيزم، فشل كلوي بدون غسيل، سرطان خامل
- النقاط: 0.5

**الفئة ج (خطير، منهك):**
- الخصائص:
  1. مرض خطير منهك
  2. علاج دوري مكلف
  3. يحتاج متابعة دورية متقاربة
  4. يحتاج مرافق
  5. لا يستطيع العمل بسببه
- أمثلة: غسيل كلوي، فشل كبدي، سرطان نشط، جراحات متكررة، شلل
- إذا الجلسات في المستشفى والحالة شديدة ومحتاج ممرضة ومتخصصين: 1.2
- إذا علاج دوري فقط ومتابعة متفرقة (2-3 مرات شهرياً): 0.9

**تصنيف الإعاقات:**

**الفئة أ (إعاقة خفيفة):**
- لا تمنع العمل
- لا تحتاج مرافق
- لا يوجد أدوية
- أمثلة: ضعف سمع بسيط، ضعف بصر قابل للتعديل، تشوه بسيط
- النقاط: 0.2

**الفئة ب (إعاقة متوسطة):**
- تؤثر على العمل جزئياً (ليس كلياً)
- لا تحتاج مرافق
- الأدوية غير مكلفة
- أمثلة: بتر جزئي، شلل جزئي، ضعف شديد في البصر
- النقاط: 0.5

**الفئة ج (إعاقة شديدة):**
- تمنع العمل
- يعتمد على الغير في الحركة
- أمثلة: شلل نصفي، إعاقة ذهنية، كفيف
- النقاط: 0.8 أو 1 (حسب العلاج)

**الفئة د (إعاقة كاملة):**
- غير قادر على الحركة أو أي عمل
- يحتاج مرافق بشكل دائم
- أمثلة: شلل رباعي، تخلف عقلي شديد، ضمور كامل
- النقاط: 1.2

#### 6. حساب المساعدات المالية

**أكواد التصنيف:**
- 1: الكفالة
- 2: الإعاقة
- 3: طالب العلم (أولاد كتير بيتعلموا، العائل مش قادر يغطي المصاريف)
- 4: السجناء
- 5: الفقراء
- 6: المتبرع بيديهم فلوس من خلال الجمعية، الجمعية لا ترى أولوية
- 7: كبار السن
- حالات فردية تعيش لوحدها

**طريقة الدفع:**
- عبر فيزا ميزة من خلال البنك
- المستفيد يعمل فيزا، الجمعية تأخذ الرقم
- البنك يعطي access على site لتحويل الأموال
- شرط: المبالغ لا تكون أكثر من 4 أرقام (عدا المجاميع التي يمكن أن تكون أكثر)

#### 7. مستويات الوصول

**وصول الأدمن:**
- وصول كامل لكل شيء
- تصدير Excel لكل البيانات

**وصول متطوعي العلاج:**
- وصول لنظام صرف العلاج فقط

**متطوعي عرض البيانات:**
- عرض بيانات الأسر فقط

**متطوعي إدخال البيانات:**
- إدخال وتعديل بيانات الأسر

**متطوعي البحث الميداني:**
- ملء نماذج البحث الميداني (ورقي أو رقمي)

#### 8. الميزات المطلوبة

**صفحة البحث عن الأسرة:**
- عرض كل بيانات الأسرة في صفحة واحدة مختصرة
- استخدام pseudo-elements لتنسيق الصفحة
- تضمين كل بيانات الأسرة

**صفحة المتابعة التعليمية:**
- إثبات قيد دراسي كل عام
- النتائج كل تيرم
- حساب مستوى الطالب على المستويات
- متابعة حفظ القرآن:
  - مستوى الطالب
  - وقف في أي سورة
  - كل 3 شهور
  - إنشاء نطاقات

**فصل البيانات:**
- فصل بيانات الأسرة عن بيانات الأولاد في الإدخال والعرض

**ميزة المقارنة:**
- مقارنة البحث الميداني بالبحث المكتبي
- عرض المشتركات (ليس exact، لكن نسبياً)

**إدارة التوزيع:**
- توزيع النقود
- توزيع الملابس (إن توفرت)
- توزيع شنط غذائية
- توزيع التبرعات العينية
- شيت Excel باختيار تصنيف الأسر
- اختيار الأسر الأكثر أولوية
- سجل استلامات الأسر
- تقارير عن مستويات المعيشة
- تقارير تقييم التغطية

**لوحة التحكم:**
- الحالات العاجلة للقيام السريع
- الحالات المستفيدة
- الحالات المرفوضة
- الحالات قيد البحث
- الحالات المنتظرة لجنة المناقشة
- الحالات الناقصة بيانات

**سجلات التوزيع:**
- سجلات التوزيع العيني
- التوزيع المالي (باستخدام معادلة قديمة، أكواد لكل تصنيف)

---

## Technical Implementation Notes

### Database Schema Requirements
- Family table with all basic information
- Member table (separate from family data)
- Income sources table (multiple sources per family)
- Expenses table
- Medical records table
- Educational tracking table
- Field research table
- Office research table
- Distribution records table
- Classification codes table
- PMT coefficients configuration table

### API Endpoints Required
- Family CRUD operations
- Member CRUD operations
- Income/Expense management
- Medical services management
- Educational tracking
- Field research forms
- Distribution management
- Reporting endpoints
- Dashboard statistics

### Frontend Components Required
- Family registration form
- Member management
- Income/Expense forms
- Medical service forms
- Educational tracking
- Field research forms
- Distribution management
- Dashboard with status cards
- Search and filter components
- Export functionality
