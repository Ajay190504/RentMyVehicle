# RentMyVehicle

RentMyVehicle is a full-stack vehicle rental marketplace that connects vehicle owners with renters through a modern web platform.

The application allows owners to list their vehicles, manage availability, and handle booking requests, while renters can browse available vehicles, search using filters, submit rental requests, and manage bookings. The platform supports three distinct roles, Customer, Owner, and Admin, and covers the full rental workflow including authentication, vehicle management, subscriptions, payments, and administrative controls.

**Live demo:** [rent-my-vehicle.vercel.app](https://rent-my-vehicle.vercel.app)

---

## Features

### User Authentication
- User registration and login
- JWT-based authentication (HMAC-SHA256) secured with Spring Security
- Password recovery flow
- User profile management

### Role-Based Access
- Three roles: Customer, Owner, and Admin
- Route-level and API-level access control based on role

### Vehicle Management (Owner)
- Add new vehicle listings
- Upload vehicle details and images, stored on Google Cloud Storage
- Update or remove existing listings
- Manage vehicle availability

### Vehicle Discovery (Customer)
- Browse available vehicles
- Search and filter listings based on requirements
- View full vehicle details before booking

### Booking System
- Submit vehicle rental requests
- Owners review and respond to booking requests
- Track booking status and history

### Subscriptions (Owner)
- Tiered subscription plans that govern listing limits and owner features
- Dedicated plan management page

### Payments
- Razorpay Java SDK integration for booking payments
- Runs in sandbox/test mode by default, with a mock-checkout fallback when live keys aren't configured

### Notifications
- Transactional email via Spring Mail / SMTP

### Admin Features
- Manage users
- Monitor vehicle listings
- Review platform activity
- Administrative controls

---

## Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Zustand (state management)
- React Hook Form
- Axios
- Tailwind CSS
- Lucide React (icons)

### Backend
- Java 21
- Spring Boot 3.3
- Spring Data JPA / Hibernate
- Spring Security
- Lombok, MapStruct

### Database
- MySQL (hosted on Aiven)

### Authentication
- JWT (jjwt) with HMAC-SHA256
- Password encryption via Spring Security

### Payments & Storage
- Razorpay Java SDK
- Google Cloud Storage (vehicle images)

### Development Tools
- Git, GitHub
- Maven, npm
- Postman

---

## Project Structure

```
RentMyVehicle/
│
├── frontend/                  # React (Vite) client
│   ├── src/
│   │   ├── pages/             # Route-level pages (Customer, Owner, Admin)
│   │   ├── components/
│   │   └── store/             # Zustand state stores
│   ├── public/
│   └── package.json
│
├── backend/                   # Spring Boot REST API
│   ├── src/main/java/...      # Controllers, services, repositories, entities
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
└── README.md
```

---

## Installation

### Clone Repository
```bash
git clone https://github.com/Ajay190504/RentMyVehicle.git
cd RentMyVehicle
```

### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Set the following for the backend (as environment variables, or defaults in `application.properties`):

```
SPRING_DATASOURCE_URL=jdbc:mysql://<host>:<port>/<database>
SPRING_DATASOURCE_USERNAME=your_db_username
SPRING_DATASOURCE_PASSWORD=your_db_password

JWT_SECRET=your_secret_key_at_least_256_bits
JWT_EXPIRATION=86400000

GCS_BUCKET_NAME=your_gcs_bucket_name
GCS_CREDENTIALS_PATH=path_to_google_credentials.json

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

SPRING_MAIL_USERNAME=your_email
SPRING_MAIL_PASSWORD=your_email_app_password

APP_CORS_ALLOWED_ORIGINS=your_frontend_url
```

> If Razorpay credentials aren't set, the backend falls back to a mock checkout for local development.

---

## Core Workflow

### Vehicle Owner
1. Register and log in.
2. Subscribe to a listing plan.
3. Add vehicle details and images.
4. Receive booking requests.
5. Accept or reject requests.
6. Manage rentals.

### Renter
1. Register and log in.
2. Browse available vehicles.
3. Search and filter listings.
4. Submit booking requests.
5. Complete payment via Razorpay.
6. Manage bookings.

### Admin
1. Log in to the admin dashboard.
2. Monitor users and vehicle listings.
3. Review platform activity.

---

## Future Enhancements

- Owner-renter messaging
- Vehicle location tracking
- Google Maps integration
- Vehicle reviews and ratings
- Real-time notifications
- Mobile application support

---

## Learning Outcomes

This project demonstrates:

- Full-stack development with Spring Boot and React
- REST API design and development
- JWT-based authentication and role-based authorization
- Relational database design with JPA/Hibernate
- Third-party API integration (Razorpay, Google Cloud Storage)
- CRUD operations
- Frontend state management
- Booking and subscription workflow design
- Client-server architecture

---

## Author

**Ajay D. Waghmare**
B.Tech Computer Science & Engineering
Java Full Stack Developer
