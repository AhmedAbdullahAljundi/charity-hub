async function checkHealth() {
    try {
        const res = await fetch('http://127.0.0.1:5000/api/health');
        const data = await res.json();
        console.log('Health check success:', data);
    } catch (err) {
        console.error('Health check failed:', err.message);
    }
}
checkHealth();
