import axios from 'axios';

async function testRegister() {
    try {
        const res = await axios.post('http://localhost:8080/api/auth/register', {
            fullName: 'Test User',
            email: 'test' + Date.now() + '@test.com',
            password: 'password123',
            location: 'Test Location',
            role: 'DONOR'
        });
        console.log('SUCCESS:', res.data);
    } catch (err) {
        console.error('ERROR RESPONSE:', err.response?.data);
        console.error('ERROR MESSAGE:', err.message);
    }
}

testRegister();
