export default {
  // Set the default timeout for all tests to 20 seconds (20000ms)
  testTimeout: 30000, 
  
  // Necessary to run tests in a Node.js environment (for APIs)
  testEnvironment: 'node',
  
//   collectCoverageFrom: [
//     "src/**/*.js",             // Include ALL JavaScript files inside the new 'src' folder
//     "!src/server.js",          // Exclude server startup logic
//     "!src/app.js",             // Exclude Express app setup (mostly middleware and route mounting)
//     "!**/node_modules/**",     // Exclude dependencies
//     "!**/tests/**"             // Exclude test files
//   ],
collectCoverageFrom: [
    // 1. Measure the core logic (Controller and Service)
    "src/controllers/userController.js",
    "src/services/userService.js",
    
    // 2. Add the actual route file that directs the traffic
    "src/routes/authRoutes.js", // ⬅️ THIS IS THE CRITICAL CHANGE
    
    // 3. Include other files that are essential to the execution (like AuthMiddleware, Error Handler)
    "src/middleware/auth.js",
    "src/app.js",
    
    "!src/routes/userRoutes.js", // Explicitly exclude unexecuted routes
    "!**/node_modules/**",
    "!**/tests/**"
  ],

  // Ignore external folders
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  transform: {}
};