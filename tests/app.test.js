import request from 'supertest';
// Assuming 'app' is exported from the relative path '../app.js'
import { app } from '../src/app.js'; 
import { mockUsers, loadMockData } from '../src/config/mockData.js'; // Needed for test credentials

// Global variables to persist data across tests
let authToken;
let houseId; 
let roomId;
let deviceId;

beforeAll(async () => {
    await loadMockData();
});

afterAll(async () => {
    // Any necessary cleanup can be performed here
});

// The main test suite for all API endpoints
describe('Smart Home API Integration Tests', () => {

  // We are removing all beforeAll/afterAll hooks and the 'http' import.
  // Supertest handles server startup internally when passed 'app'.
  
  // Store these credentials globally for the subsequent login test
  const registerCredentials = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123', 
  };

  // Mock User LOGIN SUCCESS: POST /auth/login - should login with pre-seeded mock user
  it('POST /auth/login - should login with pre-seeded mock user', async () => {
    // Ensure data is loaded (it should be from beforeAll, but we check safety)
    const demoUser = mockUsers[0]; 
    
    if (!demoUser) throw new Error('Mock data not loaded! mockUsers is empty.');

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: demoUser.email,    // ⬅️ Dynamic: Uses "user@example.com" from the array
        password: 'password123'   // Known seed password (cannot be retrieved from hash)
      })
      .set('Accept', 'application/json');

    // DEBUG: Log if it fails
    if (response.statusCode !== 200) {
      console.error('Mock Login Failed:', response.body);
    }

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('token');
    
    // Verify the user returned matches the one we requested
    expect(response.body.data.user).toHaveProperty('email', demoUser.email);

    // Save token for future tests (like GET /auth/me)
    authToken = response.body.data.token;
  });

  // REGISTRATION SUCCESS: POST /auth/register - should create a new user account (201)
  it('POST /auth/register - should create a new user account (201)', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(registerCredentials)
      .set('Accept', 'application/json');

    // Check status code and success wrapper
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('success', true);
  });


  // //LOGIN FAILURE: POST /auth/login - should fail with wrong password (401)
  // it('POST /auth/login - should fail with wrong password (401)', async () => {
  //   const response = await request(app)
  //     .post('/api/v1/auth/login')
  //     .send({
  //       email: registerCredentials.email,
  //       password: 'wrongpassword', // Use correct email but incorrect password
  //     })
  //     .set('Accept', 'application/json');

  //   // Check status code and the specific error message defined in authService
  //   expect(response.statusCode).toBe(401);
  //   expect(response.body).toHaveProperty('success', false);
  //   // Note: Matches the error thrown in your authService ("Invalid credentials")
  //   expect(response.body.message).toEqual('Invalid credentials');
  // });
});