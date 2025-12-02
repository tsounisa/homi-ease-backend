// This file runs after all test files have completed.
// It is the standard fix for persistent Supertest/TCPSERVERWRAP handles 
// that Jest fails to detect automatically in ES Module environments.
afterAll(() => {
    // We force a brief pause to allow all asynchronous I/O (like Supertest's closing connections) to finish.
    return new Promise(resolve => setTimeout(resolve, 500));
});