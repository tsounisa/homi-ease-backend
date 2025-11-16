# HomiEase - Smart Home REST API

This is a production-ready Node.js/Express server for the HomiEase Smart Home system.

## Features

* **Modular Structure:** Organized into `routes`, `controllers`, `services`, and `models`.
* **Authentication:** Uses JWT (JSON Web Tokens) for secure endpoints.
* **Database:** Uses Mongoose to connect to MongoDB.
* **Mock Data Fallback:** If no `MONGODB_URI` is provided, the API runs on fully-functional in-memory mock data.
* **Error Handling:** Centralized error handling middleware.
* **Validation:** Ready for validation middleware to be added.
* **Security:** Includes `helmet` for basic security headers.
* **Logging:** Uses `morgan` for HTTP request logging in development.

## Setup & Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repo-url>
    cd homiease-api
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the `.env.example`:
    ```sh
    cp .env.example .env
    ```
    Open `.env` and set your `JWT_SECRET`.

4.  **Running the API:**

    * **To run with Mock Data (Default):**
        Make sure `MONGODB_URI` is **blank** in your `.env` file.
        ```sh
        npm run dev
        ```

    * **To run with MongoDB:**
        Add your MongoDB connection string to the `MONGODB_URI` variable in your `.env` file.
        ```sh
        # .env
        MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/HomiEase?retryWrites=true&w=majority
        ```
        Then, start the server:
        ```sh
        npm run dev
        ```

## API Endpoints

The API routes are mounted under `/api/v1`.

* `/api/v1/auth/...`
* `/api/v1/users/...`
* `/api/v1/houses/...`
* `/api/v1/rooms/...`
* `/api/v1/devices/...`
* `/api/v1/automations/...`
* `/api/v1/scenarios/...`
* `/api/v1/security/...`

All endpoints (except registration and login) are protected and require a `Bearer <token>` in the `Authorization` header.