# Smart Civic Platform

The **Smart Civic Platform** is a full-stack web application designed to streamline the process of reporting and resolving civic issues in a community. It acts as a bridge between citizens and local authorities, allowing people to easily report problems like potholes, water leaks, uncollected garbage, or electricity outages, and enabling authorities to track and resolve these issues efficiently.

## 🚀 Core Users & Workflow

The platform supports three distinct types of users, each with a dedicated dashboard and role in the ecosystem:

1. **Citizens (Users):**
   * **Reporting:** Users can submit complaints by providing a title, description, category (e.g., road, water, garbage), and uploading photographic evidence.
   * **Location Tracking:** The system automatically converts the address they provide into precise geographical coordinates (latitude and longitude).
   * **Tracking:** They have a personal dashboard to monitor the real-time status of their complaints (Pending, In-Progress, or Resolved).

2. **Administrators (Admins):**
   * **Management:** Admins have a comprehensive dashboard where they can oversee all reported complaints across the city.
   * **Dispatching:** They can review complaints, assess their priority (Low, Medium, High), and assign specific tasks to workers.

3. **Workers:**
   * **Task Execution:** Workers receive assignments on their specific dashboard.
   * **Resolution:** They can view the exact location and details of the complaint, travel to the site, and update the status of the complaint as they work on it and eventually resolve it.

## 🛠️ Key Technical Features

* **Authentication & Security:** Secure login system with role-based access control. It also features Google Single Sign-On (SSO) and a secure OTP-based password recovery system via email.
* **Image Management:** Uses Cloudinary to seamlessly upload, store, and serve images of the reported issues.
* **Responsive Design:** Built to look great and function perfectly on both desktop and mobile devices.

## 💻 Technology Stack

Built using the modern **MERN** stack:
* **Frontend:** React (built with Vite), Tailwind CSS for styling, React Router DOM, and Axios.
* **Backend:** Node.js and Express.js to handle the server logic and API endpoints.
* **Database:** MongoDB (via Mongoose) to store users, complaints, and assignments flexibly and securely.
* **Additional Integrations:** Nodemailer (for emails/OTP), Cloudinary (for images), and Geocoding services for mapping.

## ⚙️ Local Development Setup

To run this project locally on your machine:

### 1. Clone the repository
```bash
git clone https://github.com/Kushal8085/Smart-Civic-Platform.git
cd Smart-Civic-Platform
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add your variables:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=your_cloudinary_url
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.