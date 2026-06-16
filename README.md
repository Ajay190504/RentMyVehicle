# RentMyVehicle

## Overview

RentMyVehicle is a full-stack vehicle rental marketplace that connects vehicle owners with renters through a modern web platform.

The application allows owners to list their vehicles, manage availability, and handle booking requests, while renters can browse available vehicles, search using filters, submit rental requests, and manage bookings.

The platform provides a complete rental workflow including authentication, vehicle management, booking approval, messaging, and administrative controls.

---

## Features

### User Authentication

- User registration and login
- Secure authentication
- User profile management

### Vehicle Management

- Add new vehicle listings
- Upload vehicle details and images
- Update vehicle information
- Remove vehicle listings
- Manage vehicle availability

### Vehicle Discovery

- Browse available vehicles
- Search vehicles by keyword
- Filter vehicles based on requirements
- View vehicle details before booking

### Booking System

- Request vehicle rentals
- Accept or reject booking requests
- Track booking status
- View booking history

### Messaging System

- Communication between owners and renters
- Rental-related discussions
- Booking coordination

### Admin Features

- Manage users
- Monitor vehicle listings
- Approve or review platform activity
- Administrative controls

---

## Tech Stack

### Frontend

- React.js
- React Router
- JavaScript
- HTML5
- CSS3
- Bootstrap / Tailwind CSS

### Backend

- Node.js / Express.js
- REST APIs

### Database

- MongoDB

### Authentication

- JWT Authentication
- Password Encryption

### Development Tools

- Git
- GitHub
- Postman

---

## Project Structure

```text
RentMyVehicle/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   ├── middleware/
│   └── server.js
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
npm install
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file in the backend directory.

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

---

## Core Workflow

### Vehicle Owner

1. Register and log in.
2. Add vehicle details.
3. Upload vehicle information.
4. Receive booking requests.
5. Accept or reject requests.
6. Manage rentals.

### Renter

1. Register and log in.
2. Browse available vehicles.
3. Search and filter listings.
4. Submit booking requests.
5. Communicate with owners.
6. Manage bookings.

---

## Future Enhancements

- Online payment integration
- Vehicle location tracking
- Google Maps integration
- Vehicle reviews and ratings
- Subscription plans
- Real-time notifications
- Mobile application support

---

## Learning Outcomes

This project demonstrates:

- Full Stack Development
- REST API Development
- Authentication and Authorization
- Database Design
- CRUD Operations
- Frontend State Management
- User Role Management
- Booking Workflow Design
- Client-Server Architecture

---

## Author

Ajay D. Waghmare

B.Tech Computer Science & Engineering

Java Full Stack Developer | MERN Stack Developer
