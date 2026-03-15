async function testAddMember() {
    const baseUrl = 'http://127.0.0.1:5000/api/v1'; // Assuming default port

    try {
        // 1. Login to get token
        console.log('Logging in...');
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@charityhub.com',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
        const token = loginData.token;
        console.log('Logged in successfully.');

        // 2. Get a family ID
        console.log('Fetching families...');
        const familiesRes = await fetch(`${baseUrl}/families`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const familiesData = await familiesRes.json();
        if (!familiesRes.ok) throw new Error(JSON.stringify(familiesData));
        const family = familiesData.data[0];
        if (!family) {
            console.log('No families found to test with.');
            return;
        }
        console.log(`Testing with family: ${family.headName} (${family.id})`);

        // 3. Try to add a member
        console.log('Adding a member...');
        const memberData = {
            name: 'ابن تجريبي',
            relation: 'ابن',
            birthDate: '2010-01-01',
            gender: 'ذكر',
            education: 'ابتدائي',
            job: 'طالب',
            hasDisability: false,
            maritalStatus: 'أعزب'
        };

        const addRes = await fetch(`${baseUrl}/families/${family.id}/persons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(memberData)
        });

        const addData = await addRes.json();
        if (!addRes.ok) throw new Error(JSON.stringify(addData));

        console.log('Add member response:', addData);
    } catch (error) {
        console.error('Error during test:', error.message);
    }
}

testAddMember();
