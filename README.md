# client-manager-api

A RESTful API built with Python and Flask to manage clients and invoices securely. It includes user authentication, client management, and invoice tracking with ownership checks so users only see and modify their own data. Perfect as a backend service for freelance projects, invoicing apps, or portfolio demonstration.

---

## Features

- User registration and login with JWT authentication (access + refresh tokens)
- CRUD operations for Clients and Invoices
- Authorization to restrict access to user-owned data
- Input validation and error handling (e.g., date format checks)
- Token revocation (logout blacklist)
- Organized using Flask Blueprints for clean modularity

---

## Tech Stack

- Python 3
- Flask
- Flask-JWT-Extended for authentication
- Flask-SQLAlchemy ORM with SQLite database
- Pydantic for schema validation
- Werkzeug security for password hashing

---

## How to Run Locally

1. **Clone the repo:**

    ```bash
    git clone https://github.com/YOUR_USERNAME/client-manager-api.git
    cd client-manager-api
    ```
2. **Create and activate a virtual environment (recommended)**
    ```bash
    python3 -m venv venv
    source venv/bin/activate       # On Windows: venv\Scripts\activate
    ```
3. **Install dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4. **Run the API server**
    ```bash
    python3 app.py
    ```
5. **Access the API**
    Open your browser or API client and go to:
[http://127.0.0.1:5000/book?title=The+Great+Gatsby](http://127.0.0.1:5000/
)

## Frontend

This project includes a simple frontend client built with vanilla HTML, CSS, and JavaScript to interact with the Flask backend API.

### Frontend Features

- User authentication (login/register/logout) using JWT tokens  
- View and manage clients  
- Add new clients  
- View invoices by selected client  
- Add new invoices with amount, description, due date, and status  
- Auto-formatting for phone numbers and currency inputs  
- Auto-logout after 20 minutes of inactivity  

### How to Run the Frontend Locally

1. **Serve the frontend files**  
   You can open `index.html` directly in your browser, but for full functionality and to avoid CORS issues, it's recommended to serve the files via a simple HTTP server.

2. **Using Python’s built-in HTTP server (optional)**

   From the directory containing `index.html`, run:

   ```bash
   python3 -m http.server 8000
   ```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Ensure the backend API is running locally

The frontend expects the backend API to be accessible at `http://127.0.0.1:5000`.  
Make sure you have the Flask API running as described above.

---

### Note on CORS

CORS is enabled in this project’s Flask backend to allow frontend-backend communication without cross-origin errors.

### Frontend File Summary

- **index.html**: The main HTML page with login/register forms and client/invoice management UI  
- **app.js**: JavaScript handling authentication, API requests, UI updates, and inactivity logout  
- **styles.css**: Basic styles for layout and UI components

## API Endpoints

| Method | Endpoint           | Description                          |
|--------|--------------------|------------------------------------|
| POST   | /auth/register     | Register a new user                 |
| POST   | /auth/login        | Login user, get access tokens      |
| POST   | /auth/refresh      | Refresh access token                |
| POST   | /auth/logout       | Logout and revoke token             |
| GET    | /clients/          | Get all clients for user            |
| POST   | /clients/          | Create a new client                 |
| GET    | /clients/&lt;id&gt;/  | Get a specific client              |
| PUT    | /clients/&lt;id&gt;/  | Update a client                    |
| DELETE | /clients/&lt;id&gt;/  | Delete a client                    |
| GET    | /invoices/         | Get all invoices (filter by client_id optional) |
| POST   | /invoices/         | Create a new invoice                |
| GET    | /invoices/&lt;id&gt;/ | Get a specific invoice             |
| PUT    | /invoices/&lt;id&gt;/ | Update an invoice                 |
| DELETE | /invoices/&lt;id&gt;/ | Delete an invoice                 |

## Running Tests

 Run all tests with:

    Currently, this project does not include automated tests. Tests will be added in future updates to improve reliability and coverage.
    
## Contributing

Feel free to open issues or submit pull requests if you want to contribute or suggest improvements!

## Deployment

You can deploy this Flask API easily on Render with these steps:

1. **Create a Render account**  
   Go to [https://render.com](https://render.com) and sign up for a free account.

2. **Create a new Web Service**  
   - Connect your GitHub repository with this project.
   - Choose the repo and branch you want to deploy.
   - Set the environment to **Python 3**.
   - Set the build command to:  
     ```bash
     pip install -r requirements.txt
     ```
   - Set the start command to:  
     ```bash
     gunicorn app:app
     ```
   - Optionally set environment variables if your app requires any.

3. **Deploy**  
   Click **Create Web Service** and Render will build and deploy your app automatically.

4. **Access your live API**  
   Render will provide you with a URL like `https://your-app-name.onrender.com`. Use this URL to access your deployed API.

---

### Notes

- Add a requirements.txt (use pip freeze > requirements.txt)
- For production, consider environment variables for secrets and DB config
- Add logging, error handling, and input sanitization as needed
- SQLite is for dev; consider PostgreSQL or MySQL for production

## License

This project is licensed under the MIT License.  
You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, as long as the original license and copyright notice are included.

See the [LICENSE](LICENSE) file for full details.
