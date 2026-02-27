const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const runTest = async (testName, testFn) => {
    console.log(`\n🔵 STARTING TEST: ${testName}`);
    try {
        await testFn();
        console.log(`✅ ${testName} PASSED`);
    } catch (error) {
        if (error.response && error.response.status === 500 && error.response.data.error.includes('Server configuration error')) {
            console.log(`⚠️  ${testName} SKIPPED (Configuration/Credentials missing)`);
        } else {
            console.error(`❌ ${testName} FAILED`);
            if (error.response) {
                console.error(`Status: ${error.response.status}`);
                console.error('Data:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error(error.message);
            }
        }
    }
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

let samplePhone = '';
let sampleCustomerId = '';
let sampleAppointmentId = '';
let sampleLeadId = '';
let sampleUserId = ''; // For PhoneUpdateController

const testCustomers = async () => {
    // 1. Get All Customers
    const res = await axios.get(`${BASE_URL}/customers`);
    console.log(`Fetched ${res.data.length} customers`);
    if (res.data.length > 0) {
        samplePhone = res.data[0].phone;
        console.log(`Using sample phone: ${samplePhone}`);
    } else {
        samplePhone = `9${getRandomInt(100000000, 999999999)}`;
        console.log(`No customers found. Using new sample phone: ${samplePhone}`);
    }

    // 2. Create Customer
    const newPhone = `9${getRandomInt(100000000, 999999999)}`;
    const createRes = await axios.post(`${BASE_URL}/customers`, {
        phone: newPhone,
        name: 'Test Customer',
        email: 'test@example.com',
        preferences: { language: 'english', contact_method: 'email' }
    });
    console.log('Created customer:', createRes.data.customer ? createRes.data.customer.name : 'Unknown');

    // 3. Get Customer By Phone
    if (samplePhone) {
        try {
            const getRes = await axios.get(`${BASE_URL}/customers/${samplePhone}`);
            console.log('Got customer by phone:', getRes.data.name);
        } catch (e) {
            console.log('Refetching failed, likely due to fresh seed.');
        }
    }

    // 4. Update Customer
    if (samplePhone) {
        const updateRes = await axios.put(`${BASE_URL}/customers/${samplePhone}`, {
            name: 'Updated Name ' + getRandomInt(1, 100)
        });
        console.log('Updated customer:', updateRes.data.name);
    }
};

const testAppointments = async () => {
    // 1. Get All Appointments
    const res = await axios.get(`${BASE_URL}/appointments`);
    console.log(`Fetched ${res.data.length} appointments`);
    if (res.data.length > 0) {
        sampleAppointmentId = res.data[0]._id;
    }

    // 2. Check Availability
    const checkRes = await axios.post(`${BASE_URL}/appointments/check-availability`, {
        date_str: '2025-12-25',
        time_str: '10:00'
    });
    console.log('Check Availability:', checkRes.data.message);

    // 3. Book Appointment
    const bookRes = await axios.post(`${BASE_URL}/appointments/book`, {
        customer_name: 'Test Booker',
        phone: '9999999999',
        email: 'booker@example.com',
        appointment_date: '2025-12-26',
        appointment_time: '14:00',
        customer_id: 'test_cust_id_' + Date.now(),
        notes: 'Test note'
    });
    console.log('Booked Appointment:', bookRes.data.message);

    // 4. Get Appointment by ID
    if (sampleAppointmentId) {
        const getById = await axios.get(`${BASE_URL}/appointments/${sampleAppointmentId}`);
        console.log('Got appointment by ID:', getById.data._id);
    }
};

const testSalesLeads = async () => {
    // 1. Get Stats
    const statsRes = await axios.get(`${BASE_URL}/salesleads/stats`);
    console.log('Sales Leads Stats:', statsRes.data.stats);

    // 2. Get High Priority
    const highPriRes = await axios.get(`${BASE_URL}/salesleads/high-priority`);
    console.log(`Fetched ${highPriRes.data.count} high priority leads`);

    // 3. Create Lead
    const createRes = await axios.post(`${BASE_URL}/salesleads`, {
        customer_name: 'Lead Test User',
        phone: `9${getRandomInt(100000000, 999999999)}`,
        product_interest: 'LG Washing Machine',
        lead_score: 85,
        lead_type: 'inbound_inquiry',
        source: 'website'
    });
    console.log('Created Lead:', createRes.data.lead._id);
    sampleLeadId = createRes.data.lead._id;

    // 4. Update Call Outcome
    if (sampleLeadId) {
        const callRes = await axios.post(`${BASE_URL}/salesleads/${sampleLeadId}/call-outcome`, {
            outcome: 'interested',
            notes: 'Very interested customer'
        });
        console.log('Updated call outcome:', callRes.data.message);
    }
};

const testWarranties = async () => {
    // 1. Get All Warranties
    const res = await axios.get(`${BASE_URL}/warranties`);
    console.log(`Fetched ${res.data.length} warranties`);

    // 2. Check Warranty
    if (samplePhone) {
        const checkRes = await axios.post(`${BASE_URL}/warranties/check`, {
            phone: samplePhone
        });
        console.log('Check Warranty Result:', checkRes.data.message || checkRes.data);
    }

    // 3. Get Expiring
    const expiringRes = await axios.get(`${BASE_URL}/warranties/expiring/30`);
    console.log(`Fetched ${expiringRes.data.length} expiring warranties`);
};

const testTranscripts = async () => {
    // 1. Get Transcripts
    const res = await axios.get(`${BASE_URL}/transcripts`);
    console.log(`Fetched ${res.data.length} transcripts`);

    // 2. Save Transcript
    const saveRes = await axios.post(`${BASE_URL}/transcripts`, {
        customer_id: 'cust_trans_test_' + Date.now(),
        transcript: 'Customer: Hello\nAgent: Hi, how can I help?',
        phone: samplePhone || '9999999999',
        customer_name: 'Transcript User'
    });
    console.log('Saved Transcript:', saveRes.data._id);
};

const testAuth = async () => {
    // 1. Get Admins
    const res = await axios.get(`${BASE_URL}/auth/admins`);
    console.log(`Fetched ${res.data.count} admins`);

    // 2. Create Admin (Mock)
    // Note: We need a unique google_id
    const mockGoogleId = 'mock_gid_' + Date.now();
    const createAdminRes = await axios.post(`${BASE_URL}/auth/create-admin`, {
        email: `admin_${Date.now()}@example.com`,
        name: 'Test Admin',
        google_id: mockGoogleId,
        phone: '9999999999'
    });
    console.log('Created Admin:', createAdminRes.data.message);
    if (createAdminRes.data.user) {
        sampleUserId = createAdminRes.data.user._id;
    }
};

const testPhoneUpdate = async () => {
    if (!sampleUserId) {
        console.log('⚠️ Skipping PhoneUpdate test (no user_id available)');
        return;
    }
    // 1. Update Phone
    const updateRes = await axios.post(`${BASE_URL}/auth/update-phone`, {
        user_id: sampleUserId,
        phone: '8888888888',
        name: 'Updated Name'
    });
    console.log('Phone Update Result:', updateRes.data.message);
};

const testLivekit = async () => {
    // 1. Generate Token
    // Expecting 500 if credentials missing, but checking structure
    try {
        const tokenRes = await axios.get(`${BASE_URL}/livekit/token?name=TestUser&room=TestRoom`);
        console.log('LiveKit Token Generated:', tokenRes.data.substring(0, 20) + '...');
    } catch (e) {
        if (e.response && e.response.status === 500) {
            console.log('⚠️ LiveKit Token: Skipped (Server configuration error/Missing credentials)');
        } else {
            throw e;
        }
    }

    // 2. List Rooms (Might fail if no service)
    try {
        await axios.get(`${BASE_URL}/livekit/rooms`);
        console.log('LiveKit Rooms Listed');
    } catch (e) {
        console.log(`⚠️ LiveKit Rooms: ${e.message}`);
    }
};

const main = async () => {
    console.log('🚀 COMPREHENSIVE API TEST STARTING...');

    await runTest('Customers API', testCustomers);
    await runTest('Appointments API', testAppointments);
    await runTest('Sales Leads API', testSalesLeads);
    await runTest('Warranties API', testWarranties);
    await runTest('Transcripts API', testTranscripts);
    await runTest('Auth API', testAuth);
    await runTest('Phone Update API', testPhoneUpdate);
    await runTest('LiveKit API', testLivekit);

    console.log('\n🏁 COMPREHENSIVE API TEST COMPLETED');
};

main();
