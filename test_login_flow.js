const axios = require('axios');

async function testLoginFlow() {
    console.log('🔐 Testing Coworking Login Flow...\n');
    
    const baseURL = 'http://localhost:8001';
    
    try {
        // Test the login endpoint that the frontend will use
        console.log('1. Testing login with correct credentials...');
        const loginData = {
            email: 'owner@workspace-lahore.com',
            password: 'admin123'
        };
        
        const response = await axios.post(`${baseURL}/coworking/login`, loginData);
        
        console.log('✅ Login successful!');
        console.log('Response:', {
            token_received: !!response.data.access_token,
            token_type: response.data.token_type,
            token_length: response.data.access_token?.length
        });
        
        // Test that the token works for dashboard access
        console.log('\n2. Testing dashboard access with received token...');
        const token = response.data.access_token;
        
        const dashboardResponse = await axios.get(`${baseURL}/coworking/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Dashboard accessible with token!');
        console.log('Dashboard data:', dashboardResponse.data);
        
        console.log('\n🎉 Login flow working correctly!');
        console.log('Frontend should now redirect to dashboard after login.');
        
    } catch (error) {
        console.error('❌ Login flow test failed:', error.response?.data || error.message);
    }
}

testLoginFlow();
