import request from 'supertest';
// Assuming 'app' is exported from the relative path '../app.js'
import { app } from '../src/app.js'; 
import { mockUsers } from '../src/config/mockData.js'; // Needed for test credentials

// Global variables to persist data across tests
let authToken;
let houseId; 
let roomId;
let deviceId;

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

  it('POST /auth/register - should create a new user account (201)', async () => {
    // This Supertest call should now work cleanly with Jest instrumentation.
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(registerCredentials)
      .set('Accept', 'application/json');

    // Check status code and success wrapper
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('success', true);
  });
});