const jwt = require('jsonwebtoken');

const JWT_SECRET = 'charityhub-secret-key-2024';
const BASE_URL = 'http://localhost:5000/api';

const token = jwt.sign({
  userId: 'cmp85tfuw0000v1w0ubpt7ei0',
  email: 'admin@charityhub.com',
  role: 'ADMIN',
  type: 'access'
}, JWT_SECRET, { expiresIn: '1h', issuer: 'charityhub-targeting', audience: 'charityhub-api' });

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

async function apiCall(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status} ${res.statusText} on ${method} ${path}: ${text}`);
  }
  return res.json();
}

async function deleteByCode(code) {
  try {
    const res = await apiCall('GET', `/households?search=${code}`);
    for (const h of res.data.list) {
      if (h.code === code) {
        await apiCall('DELETE', `/households/${h.id}`);
      }
    }
  } catch (e) {}
}

async function runTests() {
  const ts = Date.now().toString().slice(-6);
  const code1 = `T1-${ts}`;
  const code2 = `T2-${ts}`;
  const code3 = `T3-${ts}`;

  // Test 1
  console.log("Running TEST 1...");
  const h1 = await apiCall('POST', '/households', { code: code1, governorate: 'القاهرة', district: 'مدينة نصر', village: 'تجريبي', housingType: 'OWNED', hasRationCard: true });
  await apiCall('POST', `/households/${h1.data.id}/persons`, { name: 'محمد أحمد تجريبي', gender: 'MALE', birthDate: '1985-01-01', role: 'HEAD', isHead: true, residencyStatus: 'ABSENT_PRISON', isPrisoner: true, prisonTerm: 'LONG', prisonSuspicion: -2.0, employmentType: 'NONE', educationLevel: 'ILLITERATE', maritalStatus: 'MARRIED' });
  await apiCall('POST', `/households/${h1.data.id}/persons`, { name: 'فاطمة علي تجريبي', gender: 'FEMALE', birthDate: '1984-06-15', role: 'SPOUSE', isHead: false, residencyStatus: 'RESIDENT', employmentType: 'NONE', educationLevel: 'ILLITERATE', maritalStatus: 'MARRIED' });
  const r1 = await apiCall('POST', `/households/${h1.data.id}/calculate`);
  console.log("r1 layerBreakdown keys:", r1.data.layerBreakdown ? Object.keys(r1.data.layerBreakdown) : 'none');
  const layersArr = Array.isArray(r1.data.layerBreakdown) ? r1.data.layerBreakdown : Object.values(r1.data.layerBreakdown || {});
  const l4_1 = layersArr.find(l => l.layerId && l.layerId.includes('L4') || l.id && l.id.includes('L4'));
  console.log("TEST 1 - prisonSuspicion:");
  if (!l4_1) console.log("Available layers:", layersArr.map(l => l.layerId || l.id));
  console.log(`L4.rawScore: ${l4_1?.rawScore ?? l4_1?.score} | Expected: ≈ 0.6`);
  console.log(`normalizedPercent: ${r1.data.normalizedPercent ?? r1.data.score}% | Expected: 0%`);
  console.log(`prisonSuspicion applied: ${parseFloat(l4_1?.rawScore ?? l4_1?.score) < 1.0 ? 'YES' : 'NO'}`);
  const r1_percent = parseFloat(r1.data.normalizedPercent ?? r1.data.score);
  console.log(`Fix 1 status: ${parseFloat(l4_1?.rawScore ?? l4_1?.score) < 1.0 && r1_percent === 0 ? '✅ PASS' : '❌ FAIL'}`);

  // Test 2
  console.log("\nRunning TEST 2...");
  const h2 = await apiCall('POST', '/households', { code: code2, governorate: 'الجيزة', district: 'اختبار', village: 'تجريبي', housingType: 'OWNED', hasRationCard: true });
  await apiCall('POST', `/households/${h2.data.id}/persons`, { name: 'خالد محمود تجريبي', gender: 'MALE', birthDate: '1985-03-10', role: 'HEAD', isHead: true, residencyStatus: 'RESIDENT', employmentType: 'REGULAR', educationLevel: 'HIGHER_STABLE', maritalStatus: 'MARRIED' });
  await apiCall('POST', `/households/${h2.data.id}/persons`, { name: 'سارة حسن تجريبي', gender: 'FEMALE', birthDate: '1989-05-20', role: 'SPOUSE', isHead: false, residencyStatus: 'RESIDENT', employmentType: 'NONE', educationLevel: 'ILLITERATE', maritalStatus: 'MARRIED' });
  await apiCall('POST', `/households/${h2.data.id}/persons`, { name: 'أحمد خالد تجريبي', gender: 'MALE', birthDate: '2016-01-01', role: 'CHILD', isHead: false, residencyStatus: 'RESIDENT', isStudent: true, studentLevel: 'PRIMARY', employmentType: 'NONE', educationLevel: 'ILLITERATE', maritalStatus: 'SINGLE' });
  
  const i1 = await apiCall('POST', `/households/${h2.data.id}/income`, { channel: 'PENSION', monthlyAmount: 500 });
  await apiCall('PATCH', `/households/${h2.data.id}/income/${i1.data.id}/verify`, { status: 'VERIFIED', note: 'test' });
  const i2 = await apiCall('POST', `/households/${h2.data.id}/income`, { channel: 'TAKAFUL_KARAMA', monthlyAmount: 0 });
  await apiCall('PATCH', `/households/${h2.data.id}/income/${i2.data.id}/verify`, { status: 'VERIFIED', note: 'test' });
  const i3 = await apiCall('POST', `/households/${h2.data.id}/income`, { channel: 'CHARITY_1', monthlyAmount: 0 });
  await apiCall('PATCH', `/households/${h2.data.id}/income/${i3.data.id}/verify`, { status: 'VERIFIED', note: 'test' });
  
  const r2 = await apiCall('POST', `/households/${h2.data.id}/calculate`);
  const layersArr2 = Array.isArray(r2.data.layerBreakdown) ? r2.data.layerBreakdown : Object.values(r2.data.layerBreakdown || {});
  const l7 = layersArr2.find(l => l.layerId && l.layerId.includes('L7') || l.id && l.id.includes('L7'));
  console.log("TEST 2 - Head Employment × Education:");
  console.log(`L7.rawScore: ${l7?.rawScore ?? l7?.score} | Expected: ≤ −2.5`);
  console.log(`educationMultiplier applied: ${parseFloat(l7?.rawScore ?? l7?.score) <= -2.5 ? 'YES' : 'NO'}`);
  console.log(`Fix 2 status: ${parseFloat(l7?.rawScore ?? l7?.score) <= -2.5 ? '✅ PASS' : '❌ FAIL'}`);

  // Test 3
  console.log("\nRunning TEST 3...");
  const h3 = await apiCall('POST', '/households', { code: code3, governorate: 'الإسكندرية', district: 'اختبار', village: 'تجريبي', housingType: 'OWNED', hasRationCard: true });
  await apiCall('POST', `/households/${h3.data.id}/persons`, { name: 'عمر سعيد تجريبي', gender: 'MALE', birthDate: '1974-07-01', role: 'HEAD', isHead: true, residencyStatus: 'RESIDENT', employmentType: 'NONE', educationLevel: 'ILLITERATE', maritalStatus: 'MARRIED' });
  await apiCall('POST', `/households/${h3.data.id}/persons`, { name: 'نورا إبراهيم تجريبي', gender: 'FEMALE', birthDate: '1979-02-14', role: 'SPOUSE', isHead: false, residencyStatus: 'RESIDENT', employmentType: 'NONE', educationLevel: 'ILLITERATE', maritalStatus: 'MARRIED' });
  
  let burdenAdded = false;
  try {
    await apiCall('POST', `/households/${h3.data.id}/burdens`, { type: 'SON_IN_PRISON' });
    burdenAdded = true;
  } catch(e) {
    try {
      await apiCall('PUT', `/households/${h3.data.id}`, { hasSonInPrison: true });
      burdenAdded = true;
    } catch(e2) {
      console.log("Failed to add burden:", e2.message);
    }
  }

  const r3 = await apiCall('POST', `/households/${h3.data.id}/calculate`);
  const layersArr3 = Array.isArray(r3.data.layerBreakdown) ? r3.data.layerBreakdown : Object.values(r3.data.layerBreakdown || {});
  const l5 = layersArr3.find(l => l.layerId && l.layerId.includes('L5') || l.id && l.id.includes('L5'));
  console.log("L5 object:", JSON.stringify(l5, null, 2));
  const items = l5?.triggeredRules || [];
  const hasSonInPrisonItem = items.some(i => i.ruleId?.includes('son_in_prison'));
  console.log("TEST 3 - SON_IN_PRISON:");
  console.log(`L5.rawScore: ${l5?.rawScore ?? l5?.score} | Expected includes +0.5`);
  console.log(`SON_IN_PRISON item found: ${hasSonInPrisonItem ? 'YES' : 'NO'}`);
  console.log(`Fix 3 status: ${hasSonInPrisonItem && parseFloat(l5?.rawScore ?? l5?.score) >= 0.5 ? '✅ PASS' : '❌ FAIL'}`);

  // Cleanup
  console.log("\nCleaning up...");
  try { await apiCall('DELETE', `/households/${h1.data.id}`); } catch(e){}
  try { await apiCall('DELETE', `/households/${h2.data.id}`); } catch(e){}
  try { await apiCall('DELETE', `/households/${h3.data.id}`); } catch(e){}
  console.log("Done.");
}

runTests().catch(console.error);
