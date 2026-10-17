# Agriguide

**A comprehensive agricultural guide and networking platform connecting farmers, workers, and equipment providers.**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Agriguide is a full-stack web application designed to empower agricultural communities by providing a centralized platform for:
- Sharing agricultural knowledge and best practices
- Connecting farmers with experienced workers
- Managing crop information and stages
- Listing and discovering agricultural equipment
- Building a community of agricultural professionals

The application features a modern React frontend and a robust Spring Boot backend with MySQL database integration.

---

## ✨ Features

### Authentication & User Management
- **User Registration (Signup)** - Create new user accounts with role-based access
- **User Login** - Secure authentication system
- **User Profiles** - View and manage user information
- **Role-Based Access** - Support for Farmer, Worker, and Provider roles

### Crop Management
- **View All Crops** - Browse comprehensive crop catalog
- **Crop Details** - Detailed information about specific crops
- **Crop Search** - Find crops based on various criteria
- **Add Crops** - Register new crop varieties with specifications
- **Crop Stages** - Track growth stages and management practices

### Equipment & Services
- **Equipment Listings** - Browse available agricultural equipment
- **Add Equipment Listings** - Post equipment availability
- **Worker Listings** - Find and connect with agricultural workers
- **Add Worker Listings** - Register worker availability and skills

### Community Features
- **Farmer Experiences** - Share and learn from farmer experiences
- **Add Experiences** - Contribute knowledge to the community
- **Health Check** - System status monitoring

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.5.7
- **Language**: Java 17
- **Build Tool**: Maven
- **Database**: MySQL 8.0.33
- **ORM**: JPA/Hibernate
- **Security**: Spring Security
- **API**: RESTful Web Services
- **CORS**: Enabled for cross-origin requests

### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.14.0
- **HTTP Client**: Axios 1.4.0
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Node**: Latest LTS recommended
- **npm**: 6.0+

### Deployment
- **Backend**: Docker containerization, Render.com deployment
- **Frontend**: Vercel deployment
- **Database**: Railway MySQL hosting

### Other Tools
- **Version Control**: Git
- **Container Runtime**: Docker & Docker Compose
- **CI/CD**: Render.yaml configuration

---

## 📁 Project Structure

```
agriguide/
├── agriguid/                          # Backend (Spring Boot)
│   ├── pom.xml                        # Maven configuration
│   ├── Dockerfile                     # Docker image definition
│   ├── render.yaml                    # Render deployment config
│   ├── mvnw / mvnw.cmd               # Maven wrapper
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/agriguid/
│   │   │   │   ├── AgriguidApplication.java    # Spring Boot entry point
│   │   │   │   ├── config/
│   │   │   │   │   ├── CorsConfig.java         # CORS configuration
│   │   │   │   │   ├── DataInitializer.java    # Database initialization
│   │   │   │   │   └── SecurityConfig.java     # Security configuration
│   │   │   │   ├── controller/                 # REST API controllers
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── CropController.java
│   │   │   │   │   ├── CropStageController.java
│   │   │   │   │   ├── EquipmentListingController.java
│   │   │   │   │   ├── FarmerExperienceController.java
│   │   │   │   │   ├── HealthController.java
│   │   │   │   │   ├── UserController.java
│   │   │   │   │   └── WorkerListingController.java
│   │   │   │   ├── dto/                        # Data Transfer Objects
│   │   │   │   │   ├── AuthResponse.java
│   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   └── SignupRequest.java
│   │   │   │   ├── model/                      # Entity models
│   │   │   │   │   ├── AvailabilityStatus.java
│   │   │   │   │   ├── Crop.java
│   │   │   │   │   ├── CropStage.java
│   │   │   │   │   └── ... (other entities)
│   │   │   │   ├── repository/                 # Data access layer
│   │   │   │   └── service/                    # Business logic
│   │   │   └── resources/
│   │   │       └── application.properties      # Application configuration
│   │   └── test/
│   │       └── java/com/agriguid/
│   │           └── AgriguidApplicationTests.java
│   └── target/                        # Compiled output
│
├── frontend/                          # Frontend (React)
│   ├── package.json                   # npm configuration
│   ├── README.md                      # Frontend documentation
│   ├── vercel.json                    # Vercel deployment config
│   ├── public/                        # Static assets
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   └── src/
│       ├── App.js                     # Main App component
│       ├── App.css
│       ├── index.js                   # React entry point
│       ├── index.css
│       ├── setupTests.js
│       ├── reportWebVitals.js
│       ├── components/                # React components
│       │   ├── AddCrop.js
│       │   ├── AddEquipmentListing.js
│       │   ├── AddExperience.js
│       │   ├── AddWorkerListing.js
│       │   ├── Auth.css
│       │   ├── CropDetails.js
│       │   ├── CropList.js
│       │   ├── CropSearch.js
│       │   ├── EquipmentListings.js
│       │   ├── FarmerExperiences.js
│       │   ├── Home.js
│       │   ├── Login.js
│       │   ├── Profile.js
│       │   ├── Signup.js
│       │   └── WorkerListings.js
│       └── services/                  # API services
│           ├── api.js                 # Axios configuration
│           └── authService.js         # Authentication service
│
└── README.md                          # This file
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Backend Requirements
- **Java Development Kit (JDK)** 17 or higher
- **Maven** 3.6+ (or use the included Maven wrapper)
- **MySQL Server** 8.0+

### Frontend Requirements
- **Node.js** 16.0+ (LTS recommended)
- **npm** 6.0+ or **yarn** 1.22+

### Optional
- **Docker** 20.10+ (for containerized deployment)
- **Git** 2.0+ (for version control)

---

## 🚀 Getting Started

### Backend Setup

#### 1. Navigate to Backend Directory
```bash
cd agriguid
```

#### 2. Install Dependencies
Using Maven wrapper:
```bash
./mvnw clean install
```

Or if you have Maven installed:
```bash
mvn clean install
```

#### 3. Configure Database

Create a MySQL database:
```sql
CREATE DATABASE agriguid CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update database credentials in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/agriguid
spring.datasource.username=root
spring.datasource.password=your_password
```

#### 4. Run the Backend Server
```bash
./mvnw spring-boot:run
```

The backend will start at `http://localhost:8080`

### Frontend Setup

#### 1. Navigate to Frontend Directory
```bash
cd frontend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure API Endpoint

Update the API base URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

#### 4. Run the Development Server
```bash
npm start
```

The frontend will open at `http://localhost:3000`

---

## ⚙️ Configuration

### Backend Configuration (`application.properties`)

```properties
# Server Configuration
server.port=8080
spring.application.name=agriguid

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/agriguid
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# CORS Configuration
cors.allowed.origins=http://localhost:3000,https://agriguide-project.vercel.app
```

### Environment Variables (for Deployment)

Set these environment variables on your hosting platform:

**Backend (Render.com)**
- `PORT` - Server port (default: 8080)
- `DB_URL` - Database JDBC URL
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `CORS_ALLOWED_ORIGINS` - Allowed CORS origins

**Frontend (Vercel)**
- `REACT_APP_API_URL` - Backend API URL

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd agriguid
./mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Production Build

**Backend:**
```bash
cd agriguid
./mvnw clean package
java -jar target/agriguid-0.0.1-SNAPSHOT.jar
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the build folder with a web server
```

### Using Docker

Build and run the backend container:
```bash
cd agriguid
docker build -t agriguid-backend .
docker run -p 8080:8080 \
  -e DB_URL=jdbc:mysql://your-db-host:3306/agriguid \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=your_password \
  agriguid-backend
```

---

## 🔌 API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/user/{userId}` | Get user details |

### Crop Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/crops` | Get all crops |
| GET | `/api/crops/{id}` | Get crop by ID |
| POST | `/api/crops` | Create a new crop |
| PUT | `/api/crops/{id}` | Update crop |
| DELETE | `/api/crops/{id}` | Delete crop |

### Crop Stage Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/crop-stages` | Get all crop stages |
| GET | `/api/crop-stages/{id}` | Get stage by ID |
| POST | `/api/crop-stages` | Create new stage |

### Equipment Listing Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/equipment-listings` | Get all equipment listings |
| GET | `/api/equipment-listings/{id}` | Get listing by ID |
| POST | `/api/equipment-listings` | Create new listing |

### Worker Listing Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/worker-listings` | Get all worker listings |
| GET | `/api/worker-listings/{id}` | Get listing by ID |
| POST | `/api/worker-listings` | Create new listing |

### Farmer Experience Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/farmer-experiences` | Get all experiences |
| GET | `/api/farmer-experiences/{id}` | Get experience by ID |
| POST | `/api/farmer-experiences` | Create new experience |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check application health |

---

## 🗄️ Database Schema

The application uses the following main entities:

### User
- `userId` (PK, Long)
- `username` (String, Unique)
- `email` (String, Unique)
- `password` (String)
- `role` (Enum: FARMER, WORKER, PROVIDER)
- `profile` (String)
- `location` (String)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Crop
- `cropId` (PK, Long)
- `name` (String)
- `description` (String)
- `season` (String)
- `soilType` (String)
- `waterRequirement` (String)
- `fertilizer` (String)
- `createdAt` (Timestamp)

### CropStage
- `stageId` (PK, Long)
- `cropId` (FK, Long)
- `stageName` (String)
- `duration` (Integer)
- `description` (String)

### EquipmentListing
- `listingId` (PK, Long)
- `userId` (FK, Long)
- `equipmentName` (String)
- `description` (String)
- `location` (String)
- `status` (AvailabilityStatus)
- `createdAt` (Timestamp)

### WorkerListing
- `listingId` (PK, Long)
- `userId` (FK, Long)
- `skills` (String)
- `location` (String)
- `availability` (String)
- `status` (AvailabilityStatus)
- `createdAt` (Timestamp)

### FarmerExperience
- `experienceId` (PK, Long)
- `userId` (FK, Long)
- `title` (String)
- `description` (String)
- `cropType` (String)
- `outcome` (String)
- `createdAt` (Timestamp)

---

## 🚢 Deployment

### Backend Deployment (Render.com)

1. **Create a Render account** at https://render.com

2. **Connect your Git repository**

3. **Create a new Web Service** with:
   - Build Command: `mvn clean package -DskipTests`
   - Start Command: `java -jar target/agriguid-0.0.1-SNAPSHOT.jar`

4. **Set Environment Variables** (from render.yaml):
   ```
   PORT=8080
   DB_URL=jdbc:mysql://your-host:port/agriguid
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   CORS_ALLOWED_ORIGINS=your_frontend_url
   ```

### Frontend Deployment (Vercel)

1. **Create a Vercel account** at https://vercel.com

2. **Connect your Git repository**

3. **Deploy the `frontend` folder**

4. **Set Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```

### Database Hosting (Railway)

The application uses Railway for MySQL hosting. Update your connection string with Railway's credentials.

---

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Code Standards
- Follow Java conventions for backend code
- Use React best practices for frontend code
- Write meaningful commit messages
- Add comments for complex logic

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Support & Troubleshooting

### Common Issues

**Backend won't start:**
- Ensure MySQL is running
- Check database credentials in `application.properties`
- Verify Java 17+ is installed

**Frontend shows connection errors:**
- Ensure backend is running on port 8080
- Check CORS configuration
- Verify API endpoint in `api.js`

**CORS errors:**
- Add frontend URL to `cors.allowed.origins` in `application.properties`
- Or add your domain to Render environment variables

### Getting Help

- Check the [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- Review [React Documentation](https://react.dev)
- Check MySQL [Official Documentation](https://dev.mysql.com/doc/)

---

## 📧 Contact

For questions or inquiries about the Agriguide project, please reach out through:
- GitHub Issues
- Email: [your-email@example.com]

---

**Happy farming with Agriguide! 🌾**
